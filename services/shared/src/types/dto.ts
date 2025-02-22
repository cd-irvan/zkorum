import { z } from "zod";
import {
    zodEmail,
    zodExtendedPostData,
    zodCode,
    zodUserId,
    zodSlugId,
    zodComment,
} from "./zod.js";

export class Dto {
    static authenticateRequestBody = z
        .object({
            email: zodEmail,
            isRequestingNewCode: z.boolean(),
        })
        .strict();
    static verifyOtpReqBody = z.object({
        code: zodCode,
    });
    static authenticateResponse = z
        .object({
            codeExpiry: z.date(),
            nextCodeSoonestTime: z.date(),
        })
        .strict();
    static verifyOtp200 = z.discriminatedUnion("success", [
        z
            .object({
                success: z.literal(true),
                userId: zodUserId,
                sessionExpiry: z.date(),
            })
            .strict(),
        z
            .object({
                success: z.literal(false),
                reason: z.enum([
                    "expired_code",
                    "wrong_guess",
                    "too_many_wrong_guess",
                ]),
            })
            .strict(),
    ]);
    // WARNING when changing auth 409 - also change expected type in frontend manually!
    static auth409 =
        z.object({
            reason: z.literal("already_logged_in"),
            userId: zodUserId,
            sessionExpiry: z.date(),
        });
    static isLoggedInResponse = z.discriminatedUnion("isLoggedIn", [
        z.object({ isLoggedIn: z.literal(true), userId: zodUserId }).strict(),
        z
            .object({
                isLoggedIn: z.literal(false),
            })
            .strict(),
    ]);
    static getDeviceStatusResp = z.object({
        userId: zodUserId,
        isLoggedIn: z.boolean(),
        sessionExpiry: z.date(),
    }).strict().optional();
    static fetchFeedRequest = z
        .object({
            showHidden: z.boolean(),
            lastReactedAt: z.string().datetime().optional(),
        })
        .strict();
    static fetchFeed200 = z.array(zodExtendedPostData);
    static postFetchRequest = z.object({
        postSlugId: zodSlugId, // z.object() does not exist :(
    });
    static postFetch200 = z.object({
        post: zodExtendedPostData, // z.object() does not exist :(
        comments: z.array(zodComment),
    });
    static commentFetchFeedRequest = z.object({
        postSlugId: zodSlugId, // z.object() does not exist :(
        createdAt: z.string().datetime().optional(),
    });
    static commentFetchFeed200 = z.object({ comments: z.array(zodComment) });
    static commentFetchToVoteOnRequest = z.object({
        postSlugId: zodSlugId,
        numberOfCommentsToFetch: z.number().int().positive()
    });
    static commentFetchToVoteOn200 = z.object({ assignedComments: z.array(zodComment) });
}
export type AuthenticateRequestBody = z.infer<
    typeof Dto.authenticateRequestBody
>;
export type VerifyOtp200 = z.infer<typeof Dto.verifyOtp200>;
export type VerifyOtpReqBody = z.infer<typeof Dto.verifyOtpReqBody>;
export type Auth409 = z.infer<typeof Dto.auth409>;
export type IsLoggedInResponse = z.infer<typeof Dto.isLoggedInResponse>;
export type GetDeviceStatusResp = z.infer<typeof Dto.getDeviceStatusResp>;
export type PostFetch200 = z.infer<typeof Dto.postFetch200>;
export type FetchCommentsToVoteOn200 = z.infer<typeof Dto.commentFetchToVoteOn200>;
