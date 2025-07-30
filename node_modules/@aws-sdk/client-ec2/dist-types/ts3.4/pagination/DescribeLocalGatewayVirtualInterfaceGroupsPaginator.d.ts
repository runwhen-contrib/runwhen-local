import { Paginator } from "@smithy/types";
import {
  DescribeLocalGatewayVirtualInterfaceGroupsCommandInput,
  DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput,
} from "../commands/DescribeLocalGatewayVirtualInterfaceGroupsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeLocalGatewayVirtualInterfaceGroups: (
  config: EC2PaginationConfiguration,
  input: DescribeLocalGatewayVirtualInterfaceGroupsCommandInput,
  ...rest: any[]
) => Paginator<DescribeLocalGatewayVirtualInterfaceGroupsCommandOutput>;
