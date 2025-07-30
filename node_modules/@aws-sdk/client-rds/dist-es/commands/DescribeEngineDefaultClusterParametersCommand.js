import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeEngineDefaultClusterParametersCommand, se_DescribeEngineDefaultClusterParametersCommand, } from "../protocols/Aws_query";
export { $Command };
export class DescribeEngineDefaultClusterParametersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeEngineDefaultClusterParameters", {})
    .n("RDSClient", "DescribeEngineDefaultClusterParametersCommand")
    .f(void 0, void 0)
    .ser(se_DescribeEngineDefaultClusterParametersCommand)
    .de(de_DescribeEngineDefaultClusterParametersCommand)
    .build() {
}
