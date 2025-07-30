import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeSourceRegionsCommand, se_DescribeSourceRegionsCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeSourceRegionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeSourceRegions", {})
    .n("RDSClient", "DescribeSourceRegionsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeSourceRegionsCommand)
    .de(de_DescribeSourceRegionsCommand)
    .build() {
}
