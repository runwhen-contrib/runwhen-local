import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyOptionGroupCommand, se_ModifyOptionGroupCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyOptionGroupCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyOptionGroup", {})
    .n("RDSClient", "ModifyOptionGroupCommand")
    .f(void 0, void 0)
    .ser(se_ModifyOptionGroupCommand)
    .de(de_ModifyOptionGroupCommand)
    .build() {
}
