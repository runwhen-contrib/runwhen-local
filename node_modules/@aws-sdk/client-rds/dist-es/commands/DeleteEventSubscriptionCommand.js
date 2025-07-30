import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteEventSubscriptionCommand, se_DeleteEventSubscriptionCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteEventSubscriptionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteEventSubscription", {})
    .n("RDSClient", "DeleteEventSubscriptionCommand")
    .f(void 0, void 0)
    .ser(se_DeleteEventSubscriptionCommand)
    .de(de_DeleteEventSubscriptionCommand)
    .build() {
}
