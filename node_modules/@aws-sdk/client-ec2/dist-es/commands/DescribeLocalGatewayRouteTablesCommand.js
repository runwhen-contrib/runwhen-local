import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeLocalGatewayRouteTablesCommand, se_DescribeLocalGatewayRouteTablesCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeLocalGatewayRouteTablesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeLocalGatewayRouteTables", {})
    .n("EC2Client", "DescribeLocalGatewayRouteTablesCommand")
    .f(void 0, void 0)
    .ser(se_DescribeLocalGatewayRouteTablesCommand)
    .de(de_DescribeLocalGatewayRouteTablesCommand)
    .build() {
}
