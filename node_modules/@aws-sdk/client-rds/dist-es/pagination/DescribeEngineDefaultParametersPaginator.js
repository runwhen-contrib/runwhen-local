import { createPaginator } from "@smithy/core";
import { DescribeEngineDefaultParametersCommand, } from "../commands/DescribeEngineDefaultParametersCommand";
import { RDSClient } from "../RDSClient";
export const paginateDescribeEngineDefaultParameters = createPaginator(RDSClient, DescribeEngineDefaultParametersCommand, "Marker", "EngineDefaults.Marker", "MaxRecords");
