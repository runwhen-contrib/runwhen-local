import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeVpcPeeringConnectionsCommand, } from "../commands/DescribeVpcPeeringConnectionsCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeVpcPeeringConnectionsCommand(input));
        reason = result;
        return { state: WaiterState.SUCCESS, reason };
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidVpcPeeringConnectionID.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForVpcPeeringConnectionExists = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilVpcPeeringConnectionExists = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
