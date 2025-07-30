import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeImagesCommand } from "../commands/DescribeImagesCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeImagesCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.Images);
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
        if (exception.name && exception.name == "InvalidAMIID.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForImageExists = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilImageExists = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
