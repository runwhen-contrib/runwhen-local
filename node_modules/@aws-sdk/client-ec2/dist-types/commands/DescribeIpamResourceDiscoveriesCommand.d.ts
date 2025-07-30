import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeIpamResourceDiscoveriesRequest, DescribeIpamResourceDiscoveriesResult } from "../models/models_4";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeIpamResourceDiscoveriesCommand}.
 */
export interface DescribeIpamResourceDiscoveriesCommandInput extends DescribeIpamResourceDiscoveriesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeIpamResourceDiscoveriesCommand}.
 */
export interface DescribeIpamResourceDiscoveriesCommandOutput extends DescribeIpamResourceDiscoveriesResult, __MetadataBearer {
}
declare const DescribeIpamResourceDiscoveriesCommand_base: {
    new (input: DescribeIpamResourceDiscoveriesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeIpamResourceDiscoveriesCommandInput, DescribeIpamResourceDiscoveriesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeIpamResourceDiscoveriesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeIpamResourceDiscoveriesCommandInput, DescribeIpamResourceDiscoveriesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes IPAM resource discoveries. A resource discovery is an IPAM component that enables IPAM to manage and monitor resources that belong to the owning account.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeIpamResourceDiscoveriesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeIpamResourceDiscoveriesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeIpamResourceDiscoveriesRequest
 *   DryRun: true || false,
 *   IpamResourceDiscoveryIds: [ // ValueStringList
 *     "STRING_VALUE",
 *   ],
 *   NextToken: "STRING_VALUE",
 *   MaxResults: Number("int"),
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 * };
 * const command = new DescribeIpamResourceDiscoveriesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeIpamResourceDiscoveriesResult
 * //   IpamResourceDiscoveries: [ // IpamResourceDiscoverySet
 * //     { // IpamResourceDiscovery
 * //       OwnerId: "STRING_VALUE",
 * //       IpamResourceDiscoveryId: "STRING_VALUE",
 * //       IpamResourceDiscoveryArn: "STRING_VALUE",
 * //       IpamResourceDiscoveryRegion: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       OperatingRegions: [ // IpamOperatingRegionSet
 * //         { // IpamOperatingRegion
 * //           RegionName: "STRING_VALUE",
 * //         },
 * //       ],
 * //       IsDefault: true || false,
 * //       State: "create-in-progress" || "create-complete" || "create-failed" || "modify-in-progress" || "modify-complete" || "modify-failed" || "delete-in-progress" || "delete-complete" || "delete-failed" || "isolate-in-progress" || "isolate-complete" || "restore-in-progress",
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //       OrganizationalUnitExclusions: [ // IpamOrganizationalUnitExclusionSet
 * //         { // IpamOrganizationalUnitExclusion
 * //           OrganizationsEntityPath: "STRING_VALUE",
 * //         },
 * //       ],
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeIpamResourceDiscoveriesCommandInput - {@link DescribeIpamResourceDiscoveriesCommandInput}
 * @returns {@link DescribeIpamResourceDiscoveriesCommandOutput}
 * @see {@link DescribeIpamResourceDiscoveriesCommandInput} for command's `input` shape.
 * @see {@link DescribeIpamResourceDiscoveriesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeIpamResourceDiscoveriesCommand extends DescribeIpamResourceDiscoveriesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeIpamResourceDiscoveriesRequest;
            output: DescribeIpamResourceDiscoveriesResult;
        };
        sdk: {
            input: DescribeIpamResourceDiscoveriesCommandInput;
            output: DescribeIpamResourceDiscoveriesCommandOutput;
        };
    };
}
