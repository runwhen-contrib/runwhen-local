import { Paginator } from "@smithy/types";
import {
  DescribeBlueGreenDeploymentsCommandInput,
  DescribeBlueGreenDeploymentsCommandOutput,
} from "../commands/DescribeBlueGreenDeploymentsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeBlueGreenDeployments: (
  config: RDSPaginationConfiguration,
  input: DescribeBlueGreenDeploymentsCommandInput,
  ...rest: any[]
) => Paginator<DescribeBlueGreenDeploymentsCommandOutput>;
