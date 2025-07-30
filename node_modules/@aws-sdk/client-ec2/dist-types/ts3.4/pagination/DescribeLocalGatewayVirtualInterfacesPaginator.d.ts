import { Paginator } from "@smithy/types";
import {
  DescribeLocalGatewayVirtualInterfacesCommandInput,
  DescribeLocalGatewayVirtualInterfacesCommandOutput,
} from "../commands/DescribeLocalGatewayVirtualInterfacesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeLocalGatewayVirtualInterfaces: (
  config: EC2PaginationConfiguration,
  input: DescribeLocalGatewayVirtualInterfacesCommandInput,
  ...rest: any[]
) => Paginator<DescribeLocalGatewayVirtualInterfacesCommandOutput>;
