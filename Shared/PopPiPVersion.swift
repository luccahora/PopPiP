import Foundation

enum PopPiPVersion {
    static func displayVersion(from info: [String: Any]) -> String {
        let short = info["CFBundleShortVersionString"] as? String ?? "Unknown"
        let build = info["CFBundleVersion"] as? String
        return build.map { "\(short) (\($0))" } ?? short
    }
}

