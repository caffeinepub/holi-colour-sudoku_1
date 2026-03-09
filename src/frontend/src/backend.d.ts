import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Participant {
    name: string;
    sesaId: string;
    registeredAt: bigint;
}
export interface Submission {
    name: string;
    boardState: Array<bigint>;
    submittedAt: bigint;
    isCorrect: boolean;
    sesaId: string;
    timeTakenSeconds: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClues(): Promise<Array<bigint>>;
    getParticipants(): Promise<Array<Participant>>;
    getSubmissions(): Promise<Array<Submission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasSubmitted(sesaId: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isRegistered(sesaId: string): Promise<boolean>;
    registerParticipant(name: string, sesaId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitPuzzle(sesaId: string, boardState: Array<bigint>, timeTakenSeconds: bigint): Promise<void>;
}
