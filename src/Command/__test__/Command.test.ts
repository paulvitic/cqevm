import {Command, command} from "../Command";


describe("", () => {
    it("", () => {
        const TEST_COMMAND = "TEST_COMMAND"
        type TestCommand = {a: string}
        const a = "some value"
        const testCommand: Command<TestCommand> = command(TEST_COMMAND, { a })
        expect(testCommand.type).toBe(TEST_COMMAND)
        expect(testCommand.a).toBe(a)
    })
})
