import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteCustomDBEngineVersionCommand, se_DeleteCustomDBEngineVersionCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteCustomDBEngineVersionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteCustomDBEngineVersion", {})
    .n("RDSClient", "DeleteCustomDBEngineVersionCommand")
    .f(void 0, void 0)
    .ser(se_DeleteCustomDBEngineVersionCommand)
    .de(de_DeleteCustomDBEngineVersionCommand)
    .build() {
}
