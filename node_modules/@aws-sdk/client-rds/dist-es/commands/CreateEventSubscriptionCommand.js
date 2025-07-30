import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateEventSubscriptionCommand, se_CreateEventSubscriptionCommand } from "../protocols/Aws_query";
export { $Command };
export class CreateEventSubscriptionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "CreateEventSubscription", {})
    .n("RDSClient", "CreateEventSubscriptionCommand")
    .f(void 0, void 0)
    .ser(se_CreateEventSubscriptionCommand)
    .de(de_CreateEventSubscriptionCommand)
    .build() {
}
