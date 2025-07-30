import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeScheduledInstancesRequest, DescribeScheduledInstancesResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeScheduledInstancesCommand}.
 */
export interface DescribeScheduledInstancesCommandInput extends DescribeScheduledInstancesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeScheduledInstancesCommand}.
 */
export interface DescribeScheduledInstancesCommandOutput extends DescribeScheduledInstancesResult, __MetadataBearer {
}
declare const DescribeScheduledInstancesCommand_base: {
    new (input: DescribeScheduledInstancesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeScheduledInstancesCommandInput, DescribeScheduledInstancesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeScheduledInstancesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeScheduledInstancesCommandInput, DescribeScheduledInstancesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the specified Scheduled Instances or all your Scheduled Instances.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeScheduledInstancesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeScheduledInstancesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeScheduledInstancesRequest
 *   DryRun: true || false,
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [ // ValueStringList
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 *   ScheduledInstanceIds: [ // ScheduledInstanceIdRequestSet
 *     "STRING_VALUE",
 *   ],
 *   SlotStartTimeRange: { // SlotStartTimeRangeRequest
 *     EarliestTime: new Date("TIMESTAMP"),
 *     LatestTime: new Date("TIMESTAMP"),
 *   },
 * };
 * const command = new DescribeScheduledInstancesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeScheduledInstancesResult
 * //   NextToken: "STRING_VALUE",
 * //   ScheduledInstanceSet: [ // ScheduledInstanceSet
 * //     { // ScheduledInstance
 * //       AvailabilityZone: "STRING_VALUE",
 * //       CreateDate: new Date("TIMESTAMP"),
 * //       HourlyPrice: "STRING_VALUE",
 * //       InstanceCount: Number("int"),
 * //       InstanceType: "STRING_VALUE",
 * //       NetworkPlatform: "STRING_VALUE",
 * //       NextSlotStartTime: new Date("TIMESTAMP"),
 * //       Platform: "STRING_VALUE",
 * //       PreviousSlotEndTime: new Date("TIMESTAMP"),
 * //       Recurrence: { // ScheduledInstanceRecurrence
 * //         Frequency: "STRING_VALUE",
 * //         Interval: Number("int"),
 * //         OccurrenceDaySet: [ // OccurrenceDaySet
 * //           Number("int"),
 * //         ],
 * //         OccurrenceRelativeToEnd: true || false,
 * //         OccurrenceUnit: "STRING_VALUE",
 * //       },
 * //       ScheduledInstanceId: "STRING_VALUE",
 * //       SlotDurationInHours: Number("int"),
 * //       TermEndDate: new Date("TIMESTAMP"),
 * //       TermStartDate: new Date("TIMESTAMP"),
 * //       TotalScheduledInstanceHours: Number("int"),
 * //     },
 * //   ],
 * // };
 *
 * ```
 *
 * @param DescribeScheduledInstancesCommandInput - {@link DescribeScheduledInstancesCommandInput}
 * @returns {@link DescribeScheduledInstancesCommandOutput}
 * @see {@link DescribeScheduledInstancesCommandInput} for command's `input` shape.
 * @see {@link DescribeScheduledInstancesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeScheduledInstancesCommand extends DescribeScheduledInstancesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeScheduledInstancesRequest;
            output: DescribeScheduledInstancesResult;
        };
        sdk: {
            input: DescribeScheduledInstancesCommandInput;
            output: DescribeScheduledInstancesCommandOutput;
        };
    };
}
