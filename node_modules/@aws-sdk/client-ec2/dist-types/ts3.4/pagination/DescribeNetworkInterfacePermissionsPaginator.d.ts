import { Paginator } from "@smithy/types";
import {
  DescribeNetworkInterfacePermissionsCommandInput,
  DescribeNetworkInterfacePermissionsCommandOutput,
} from "../commands/DescribeNetworkInterfacePermissionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeNetworkInterfacePermissions: (
  config: EC2PaginationConfiguration,
  input: DescribeNetworkInterfacePermissionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeNetworkInterfacePermissionsCommandOutput>;
