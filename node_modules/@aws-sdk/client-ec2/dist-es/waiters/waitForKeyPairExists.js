import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeKeyPairsCommand } from "../commands/DescribeKeyPairsCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeKeyPairsCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.KeyPairs);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.KeyName;
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
        if (exception.name && exception.name == "InvalidKeyPair.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForKeyPairExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilKeyPairExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
