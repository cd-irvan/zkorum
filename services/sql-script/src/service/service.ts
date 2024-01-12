import { toEncodedCID } from "@/shared/common/cid.js";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { generateRandomSlugId } from "../crypto.js";
import { pollResponseTable, pollTable } from "../schema.js";
import { Presentation, initializeWasm } from "@docknetwork/crypto-wasm-ts";

interface CreateSlugProps {
    db: PostgresJsDatabase;
}

export class Service {
    static async createSlugIdAndPresentationCID({
        db,
    }: CreateSlugProps): Promise<void> {
        await initializeWasm();
        const results = await db
            .select({
                pollId: pollTable.id,
                presentation: pollTable.presentation,
                createdAt: pollTable.createdAt,
            })
            .from(pollTable);
        for (const result of results) {
            const presentationCID = await toEncodedCID(result.presentation);
            console.log(
                `Poll updated at ${
                    result.createdAt
                } ${result.createdAt.getMilliseconds()}`
            );
            await db
                .update(pollTable)
                .set({
                    slugId: generateRandomSlugId(),
                    presentationCID: presentationCID, // Check for replay attack (same presentation) - done by the database *unique* rule
                })
                .where(eq(pollTable.id, result.pollId));
        }

        const resultPollResponse = await db
            .select({
                id: pollResponseTable.id,
                presentation: pollResponseTable.presentation,
                createdAt: pollResponseTable.createdAt,
            })
            .from(pollResponseTable);
        for (const result of resultPollResponse) {
            console.log(
                `Response updated at ${
                    result.createdAt
                } ${result.createdAt.getMilliseconds()}`
            );
            const presentationCID = await toEncodedCID(result.presentation);
            const timestampedPresentation = {
                timestamp: result.createdAt.getTime(),
                presentation: Presentation.fromJSON(result.presentation),
            };
            const timestampedPresentationCID = await toEncodedCID(
                timestampedPresentation
            );
            await db
                .update(pollResponseTable)
                .set({
                    presentationCID: presentationCID, // Check for replay attack (same presentation) - done by the database *unique* rule
                    timestampedPresentationCID: timestampedPresentationCID,
                })
                .where(eq(pollResponseTable.id, result.id));
        }
    }
}