import { checkExceptions, createWaiter, WaiterState } from "@smithy/util-waiter";
import { DescribeDBClustersCommand } from "../commands/DescribeDBClustersCommand";
const checkState = async (client, input) => {
    let reason;
    try {
        const result = await client.send(new DescribeDBClustersCommand(input));
        reason = result;
        try {
            const returnComparator = () => {
                return result.DBClusters.length == 0.0;
            };
            if (returnComparator() == true) {
                return { state: WaiterState.SUCCESS, reason };
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.DBClusters);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "creating") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.DBClusters);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "modifying") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.DBClusters);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "rebooting") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
        try {
            const returnComparator = () => {
                const flat_1 = [].concat(...result.DBClusters);
                const projection_3 = flat_1.map((element_2) => {
                    return element_2.Status;
                });
                return projection_3;
            };
            for (const anyStringEq_4 of returnComparator()) {
                if (anyStringEq_4 == "resetting-master-credentials") {
                    return { state: WaiterState.FAILURE, reason };
                }
            }
        }
        catch (e) { }
    }
    catch (exception) {
        reason = exception;
        if (exception.name && exception.name == "DBClusterNotFoundFault") {
            return { state: WaiterState.SUCCESS, reason };
        }
    }
    return { state: WaiterState.RETRY, reason };
};
export const waitForDBClusterDeleted = async (params, input) => {
    const serviceDefaults = { minDelay: 30, maxDelay: 120 };
    return createWaiter({ ...serviceDefaults, ...params }, input, checkState);
};
export const waitUntilDBClusterDeleted = async (params, input) => {
    const serviceDefaults = { minDelay: 30, maxDelay: 120 };
    const result = await createWaiter({ ...serviceDefaults, ...params }, input, checkState);
    return checkExceptions(result);
};
