import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeSpotInstanceRequestsCommand, } from "../commands/DescribeSpotInstanceRequestsCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeSpotInstanceRequestsCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            let allStringEq_5 = returnComparator().length > 0;
            for (const element_4 of returnComparator()) {
                allStringEq_5 = allStringEq_5 && element_4 == "fulfilled";
            }
            if (allStringEq_5) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            let allStringEq_5 = returnComparator().length > 0;
            for (const element_4 of returnComparator()) {
                allStringEq_5 = allStringEq_5 && element_4 == "request-canceled-and-instance-running";
            }
            if (allStringEq_5) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "schedule-expired") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "canceled-before-fulfillment") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "bad-parameters") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.SpotInstanceRequests);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status.Code;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "system-error") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "InvalidSpotInstanceRequestID.NotFound") {
            return { state: WaiterState.RETRY, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForSpotInstanceRequestFulfilled = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilSpotInstanceRequestFulfilled = async (params, input) => {
    const serviceDefaults = { minDelay: 15, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
