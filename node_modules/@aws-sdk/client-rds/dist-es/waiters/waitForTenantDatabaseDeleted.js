import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeTenantDatabasesCommand, } from "../commands/DescribeTenantDatabasesCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeTenantDatabasesCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                return result.TenantDatabases.length == 0.0;
            };
            if (returnComparator() == true) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "DBInstanceNotFoundFault") {
            return { state: WaiterState.SUCCESS, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForTenantDatabaseDeleted = async (params, input) => {
    const serviceDefaults = { minDelay: 30, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilTenantDatabaseDeleted = async (params, input) => {
    const serviceDefaults = { minDelay: 30, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
