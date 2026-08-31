import XCTest
@testable import PopPiP

final class PopPiPTests: XCTestCase {
    func testDisplayVersionIncludesBuildNumber() {
        let info: [String: Any] = ["CFBundleShortVersionString": "1.2.3", "CFBundleVersion": "42"]
        XCTAssertEqual(PopPiPVersion.displayVersion(from: info), "1.2.3 (42)")
    }

    func testDisplayVersionHandlesMissingMetadata() {
        XCTAssertEqual(PopPiPVersion.displayVersion(from: [:]), "Unknown")
    }
}

