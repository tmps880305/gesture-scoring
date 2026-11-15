// Renders a square splash image: solid background with a centered logo (SVG or PNG).
// macOS only (uses AppKit). Used by `npm run generate:ios-splash`.
//
// Usage: swift scripts/render-splash.swift <logo> <canvasPx> <logoPx> <bgHex> <out.png> [more-out.png ...]
import AppKit

let args = CommandLine.arguments
guard args.count >= 6 else {
    fputs("Usage: render-splash.swift <logo> <canvasPx> <logoPx> <bgHex> <out.png> [more-out.png ...]\n", stderr)
    exit(1)
}
guard let logo = NSImage(contentsOfFile: args[1]) else {
    fputs("Cannot read logo: \(args[1])\n", stderr)
    exit(1)
}
guard let canvas = Int(args[2]), let logoSize = Int(args[3]), logoSize <= canvas else {
    fputs("canvasPx and logoPx must be integers, logoPx <= canvasPx\n", stderr)
    exit(1)
}
guard let hex = Int(args[4].replacingOccurrences(of: "#", with: ""), radix: 16) else {
    fputs("Invalid bgHex: \(args[4])\n", stderr)
    exit(1)
}
let outputs = Array(args[5...])

let background = NSColor(
    srgbRed: CGFloat((hex >> 16) & 0xff) / 255,
    green: CGFloat((hex >> 8) & 0xff) / 255,
    blue: CGFloat(hex & 0xff) / 255,
    alpha: 1
)

guard let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: canvas, pixelsHigh: canvas,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
) else {
    fputs("Cannot create bitmap\n", stderr)
    exit(1)
}
rep.size = NSSize(width: canvas, height: canvas)

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
background.setFill()
NSRect(x: 0, y: 0, width: canvas, height: canvas).fill()
let origin = (canvas - logoSize) / 2
logo.draw(in: NSRect(x: origin, y: origin, width: logoSize, height: logoSize))
NSGraphicsContext.restoreGraphicsState()

guard let png = rep.representation(using: .png, properties: [:]) else {
    fputs("Cannot encode PNG\n", stderr)
    exit(1)
}
for output in outputs {
    do {
        try png.write(to: URL(fileURLWithPath: output))
        print("[splash] wrote \(output)")
    } catch {
        fputs("Cannot write \(output): \(error)\n", stderr)
        exit(1)
    }
}
