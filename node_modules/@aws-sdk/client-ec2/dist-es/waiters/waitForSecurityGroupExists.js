import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeSecurityGroupsCommand, } from "../commands/DescribeSecurityGroupsCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeSecurityGroupsCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SecurityGroups);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.GroupId;
                });
                return projection_3.length > 0.0;
            };
            if (returnComparator() == true) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidGroup.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForSecurityGroupExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilSecurityGroupExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
