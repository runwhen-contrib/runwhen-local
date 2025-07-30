import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeVpcsCommand } from "../commands/DescribeVpcsCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeVpcsCommand(input));
        reason = result;
        return { state: WaiterState.SUCCESS, reason };
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidVpcID.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForVpcExists = async (params, input) => {
    const serviceDefaults = { minDelay: 1, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilVpcExists = async (params, input) => {
    const serviceDefaults = { minDelay: 1, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
