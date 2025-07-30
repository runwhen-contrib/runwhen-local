import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBEngineVersionsCommand, se_DescribeDBEngineVersionsCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBEngineVersionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBEngineVersions", {})
    .n("RDSClient", "DescribeDBEngineVersionsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBEngineVersionsCommand)
    .de(de_DescribeDBEngineVersionsCommand)
    .build() {
}
