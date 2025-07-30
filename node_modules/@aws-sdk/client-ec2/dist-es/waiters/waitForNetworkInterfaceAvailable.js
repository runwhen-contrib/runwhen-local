import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeNetworkInterfacesCommand, } from "../commands/DescribeNetworkInterfacesCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeNetworkInterfacesCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.NetworkInterfaces);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status;
                });
                return projection_3;
            };
            let allStringEq_5 = returnComparator().length > 0;
            for (const element_4 of returnComparator()) {
                allStringEq_5 = allStringEq_5 && element_4 == "available";
            }
            if (allStringEq_5) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidNetworkInterfaceID.NotFound") {
            return { state: WaiterState.FAILURE, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForNetworkInterfaceAvailable = async (params, input) => {
    const serviceDefaults = { minDelay: 20, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilNetworkInterfaceAvailable = async (params, input) => {
    const serviceDefaults = { minDelay: 20, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
