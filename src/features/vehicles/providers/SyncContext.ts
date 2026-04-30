import { createContext, useContext } from "react";

/**
 * Shared context used to mark the vehicle synchronization boundary.
 *
 * The current sync hooks do not expose values, but the context keeps a stable
 * place for future sync status without coupling consumers to the provider file.
 */
export const SyncContext = createContext({});

/**
 * Reads the vehicle synchronization context.
 *
 * @returns The current synchronization context value.
 */
export const useSync = () => useContext(SyncContext);
