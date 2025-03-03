import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { expect, describe, it } from "vitest";
import { z } from "zod";

const bookSchema = z.object({
    pk: z.string(),
    sk: z.string(),
    author: z.string(),
    title: z.string(),
});

// NOTE: Using the local endpoint for DynamoDB to connect to our Docker container
const dynamodb = new DynamoDB({
    endpoint: "http://localhost:8000",
});
const TableName = "test-db";

describe("create-book", () => {
    describe("SUCCESS", () => {
        it("creates a book", async () => {
            await dynamodb.send(
                new PutCommand({
                    TableName,
                    Item: {
                        pk: "USER#3",
                        sk: "BOOK#3",
                        author: "Example Author",
                        title: "Example Title",
                    },
                }),
            );

            const { Item: book } = await dynamodb.send(
                new GetCommand({
                    TableName,
                    Key: {
                        pk: "USER#3",
                        sk: "BOOK#3",
                    },
                }),
            );

            console.log(book);

            const parsedBook = bookSchema.parse(book);

            expect(parsedBook).toMatchObject({
                pk: "USER#3",
                sk: "BOOK#3",
                author: "Example Author",
                title: "Example Title",
            });
        });
    });
});
