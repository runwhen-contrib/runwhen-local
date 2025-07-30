import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeInstanceStatusCommand, } from "../commands/DescribeInstanceStatusCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeInstanceStatusCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.InstanceStatuses);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.SystemStatus.Status;
                });
                return projection_3;
            };
            let allStringEq_5 = returnComparator().length > 0;
            for (const element_4 of returnComparator()) {
                allStringEq_5 = allStringEq_5 && element_4 == "ok";
            }
            if (allStringEq_5) {
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
export const waitForSystemStatusOk = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilSystemStatusOk = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
