import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateDBParameterGroupCommand, se_CreateDBParameterGroupCommand } from "../protocols/Aws_query";
export { $Command };
export class CreateDBParameterGroupCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "CreateDBParameterGroup", {})
    .n("RDSClient", "CreateDBParameterGroupCommand")
    .f(void 0, void 0)
    .ser(se_CreateDBParameterGroupCommand)
    .de(de_CreateDBParameterGroupCommand)
    .build() {
}
