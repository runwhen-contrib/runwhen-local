import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeInstancesCommand } from "../commands/DescribeInstancesCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeInstancesCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.Reservations);
                return flat_1.length > 0.0;
            };
            if (returnComparator() == true) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidInstanceID.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForInstanceExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilInstanceExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
