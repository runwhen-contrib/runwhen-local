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
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Instances;
                });
                const flat_4 = [].concat(...projection_3);
                const projection_6 = flat_4.map((element_5) => {
                    return element_5.State.Name;
                });
                return projection_6;
            };
            let allStringEq_8 = returnComparator().length > 0;
            for (const element_7 of returnComparator()) {
                allStringEq_8 = allStringEq_8 && element_7 == "terminated";
            }
            if (allStringEq_8) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.Reservations);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Instances;
                });
                const flat_4 = [].concat(...projection_3);
                const projection_6 = flat_4.map((element_5) => {
                    return element_5.State.Name;
                });
                return projection_6;
            };
            for (const anyStringEq_7 of returnComparator()) {
                if (anyStringEq_7 == "pending") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.Reservations);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Instances;
                });
                const flat_4 = [].concat(...projection_3);
                const projection_6 = flat_4.map((element_5) => {
                    return element_5.State.Name;
                });
                return projection_6;
            };
            for (const anyStringEq_7 of returnComparator()) {
                if (anyStringEq_7 == "stopping") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForInstanceTerminated = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilInstanceTerminated = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
