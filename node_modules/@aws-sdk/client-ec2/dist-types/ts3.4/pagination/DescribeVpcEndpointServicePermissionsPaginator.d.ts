import { Paginator } from "@smithy/types";
import {
  DescribeVpcEndpointServicePermissionsCommandInput,
  DescribeVpcEndpointServicePermissionsCommandOutput,
} from "../commands/DescribeVpcEndpointServicePermissionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVpcEndpointServicePermissions: (
  config: EC2PaginationConfiguration,
  input: DescribeVpcEndpointServicePermissionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVpcEndpointServicePermissionsCommandOutput>;
