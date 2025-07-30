import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_StartActivityStreamCommand, se_StartActivityStreamCommand } from "../protocols/Aws_query";
export { $Command };
export class StartActivityStreamCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "StartActivityStream", {})
    .n("RDSClient", "StartActivityStreamCommand")
    .f(void 0, void 0)
    .ser(se_StartActivityStreamCommand)
    .de(de_StartActivityStreamCommand)
    .build() {
}
