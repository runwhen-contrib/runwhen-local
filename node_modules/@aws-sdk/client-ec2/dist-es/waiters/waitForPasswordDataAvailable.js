import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { GetPasswordDataCommand } from "../commands/GetPasswordDataCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new GetPasswordDataCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                return result.PasswordData.length > 0.0;
            };
            if (returnComparator() == true) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForPasswordDataAvailable = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilPasswordDataAvailable = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
