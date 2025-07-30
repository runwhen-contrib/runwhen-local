import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeInternetGatewaysCommand, } from "../commands/DescribeInternetGatewaysCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeInternetGatewaysCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.InternetGateways);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.InternetGatewayId;
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
        if (exception.name && exception.name == "InvalidInternetGateway.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForInternetGatewayExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilInternetGatewayExists = async (params, input) => {
    const serviceDefaults = { minDelay: 5, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
