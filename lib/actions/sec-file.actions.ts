"use server";

import { createAdminClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
  };

  
export const uploadPartitionedFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const fileBuffer = Buffer.from(file); // Convert file to Buffer if not already
    const partitionSize = Math.ceil(fileBuffer.length / 5);
    const fileId = ID.unique(); // Unique ID for the file

    const partitionIds: string[] = [];

    // Partition the file and upload each part
    for (let i = 0; i < 5; i++) {
      const start = i * partitionSize;
      const end = Math.min((i + 1) * partitionSize, fileBuffer.length);
      const partitionData = fileBuffer.slice(start, end);
      const partitionInputFile = InputFile.fromBuffer(partitionData, `${file.name}.part${i}`);

      const partition = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        partitionInputFile
      );

      partitionIds.push(partition.$id);
    }

    // Create a document to track the file and its partitions
    const fileDocument = {
      name: file.name,
      owner: ownerId,
      accountId,
      partitionIds,
      size: fileBuffer.length,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId,
        fileDocument
      )
      .catch(async (error: unknown) => {
        // Cleanup uploaded partitions in case of error
        for (const partitionId of partitionIds) {
          await storage.deleteFile(appwriteConfig.bucketId, partitionId);
        }
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return newFile;
  } catch (error) {
    handleError(error, "Failed to upload partitioned file");
  }
};

export const downloadPartitionedFile = async (fileId: string) => {
  const { storage, databases } = await createAdminClient();

  try {
    const fileDocument = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    const partitionIds: string[] = fileDocument.partitionIds;

    const fileParts: Buffer[] = [];

    for (const partitionId of partitionIds) {
      const partitionStream = await storage.getFileDownload(
        appwriteConfig.bucketId,
        partitionId
      );

      const partitionBuffer = Buffer.from(await partitionStream.arrayBuffer());
      fileParts.push(partitionBuffer);
    }

    // Combine all partitions into the original file
    const mergedFile = Buffer.concat(fileParts);

    return {
      name: fileDocument.name,
      data: mergedFile,
    };
  } catch (error) {
    handleError(error, "Failed to download partitioned file");
  }
};
