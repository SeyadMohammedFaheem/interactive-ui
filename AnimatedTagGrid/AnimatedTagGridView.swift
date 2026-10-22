import SwiftUI

// MARK: - Theme Item Model

struct ThemeItem: Identifiable, Equatable {
    let id: String
    let name: String
    let icon: String
    let tint: Color
    let rotationDegrees: Double
    
    init(_ name: String, icon: String, tint: Color, rotation: Double = -3.5) {
        self.id = name
        self.name = name
        self.icon = icon
        self.tint = tint
        self.rotationDegrees = rotation
    }
}

// MARK: - Custom Font Helper (Plus Jakarta Sans)

extension Font {
    /// Returns Plus Jakarta Sans if installed in Xcode bundle, otherwise falls back gracefully to system font.
    static func jakarta(size: CGFloat, weight: Font.Weight = .medium) -> Font {
        let fontName: String
        switch weight {
        case .bold, .heavy, .black:
            fontName = "PlusJakartaSans-Bold"
        case .semibold:
            fontName = "PlusJakartaSans-SemiBold"
        case .medium:
            fontName = "PlusJakartaSans-Medium"
        default:
            fontName = "PlusJakartaSans-Regular"
        }
        
        return .custom(fontName, size: size)
    }
}

// MARK: - Floating Preview Chips View (Matching Nitish Khagwal's Interaction)

struct FloatingPreviewChipsView: View {
    
    // Fixed staggered cloud layout matching reference video with subtle natural rotations
    let row1 = [
        ThemeItem("Cardboard", icon: "folder.fill",           tint: Color(red: 0.82, green: 0.54, blue: 0.32), rotation: -3.5),
        ThemeItem("Charcoal",  icon: "flame.fill",            tint: Color(red: 0.95, green: 0.42, blue: 0.22), rotation: 3.0)
    ]
    
    let row2 = [
        ThemeItem("Drift",     icon: "backpack.fill",         tint: Color(red: 0.10, green: 0.82, blue: 0.54), rotation: -4.0), // -4° tilt matching screenshot
        ThemeItem("Fuzzy",     icon: "headphones",            tint: Color(red: 0.25, green: 0.52, blue: 0.95), rotation: 2.5),
        ThemeItem("Gloss",     icon: "sparkles",              tint: Color(red: 0.98, green: 0.76, blue: 0.14), rotation: -3.0)
    ]
    
    let row3 = [
        ThemeItem("Ink",       icon: "tray.full.fill",        tint: Color(red: 0.35, green: 0.40, blue: 0.48), rotation: -2.5),
        ThemeItem("Mist",      icon: "tent.fill",             tint: Color(red: 0.45, green: 0.72, blue: 0.78), rotation: 3.5),
        ThemeItem("Pebble",    icon: "circle.grid.2x2.fill",  tint: Color(red: 0.55, green: 0.58, blue: 0.62), rotation: -3.0)
    ]
    
    let row4 = [
        ThemeItem("Sketchy",   icon: "pencil.and.ruler.fill", tint: Color(red: 0.92, green: 0.62, blue: 0.18), rotation: 3.0),
        ThemeItem("Yarn",      icon: "cup.and.saucer.fill",   tint: Color(red: 0.88, green: 0.48, blue: 0.38), rotation: -4.0)
    ]
    
    @State private var activeItem: ThemeItem? = nil
    @State private var pillFrames: [String: CGRect] = [:]
    
    // Debounce task to bridge inter-tab cursor travel seamlessly
    @State private var dismissTask: Task<Void, Never>? = nil
    
    // Fluid spring physics
    private let glideSpring: Animation = .spring(
        response: 0.35,
        dampingFraction: 0.70,
        blendDuration: 0.15
    )
    
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
            
            // Fixed tag rows
            VStack(spacing: 16) {
                tagRow(row1)
                tagRow(row2)
                tagRow(row3)
                tagRow(row4)
            }
            .coordinateSpace(name: "TagCloudStage")
            
            // The single floating card that smoothly glides between tabs
            if let active = activeItem, let rect = pillFrames[active.id] {
                FloatingPreviewCard(item: active)
                    .position(
                        x: rect.midX,
                        y: rect.minY - 62
                    )
                    // Subtle rotation matching reference screenshot
                    .rotationEffect(.degrees(active.rotationDegrees))
                    .transition(
                        .asymmetric(
                            insertion: .scale(scale: 0.4, anchor: .bottom)
                                .combined(with: .opacity)
                                .combined(with: .offset(y: 18)),
                            removal: .scale(scale: 0.4, anchor: .bottom)
                                .combined(with: .opacity)
                        )
                    )
                    .zIndex(999)
                    .allowsHitTesting(false)
            }
        }
        .animation(glideSpring, value: activeItem)
    }
    
    // MARK: - Row Helper
    
    @ViewBuilder
    private func tagRow(_ items: [ThemeItem]) -> some View {
        HStack(spacing: 16) {
            ForEach(items) { item in
                let isActive = activeItem == item
                
                // Typography using Plus Jakarta Sans
                Text(item.name)
                    .font(.jakarta(size: 17, weight: isActive ? .bold : .medium))
                    .foregroundStyle(isActive ? Color.black : Color(white: 0.12))
                    .padding(.horizontal, 24)
                    .padding(.vertical, 13)
                    .background(
                        Capsule()
                            .fill(Color(white: 0.94))
                    )
                    .background(
                        GeometryReader { proxy in
                            Color.clear.preference(
                                key: PillPositionPreferenceKey.self,
                                value: [item.id: proxy.frame(in: .named("TagCloudStage"))]
                            )
                        }
                    )
                    .onHover { hovering in
                        handleHover(for: item, isHovering: hovering)
                    }
                    .onTapGesture {
                        withAnimation(glideSpring) {
                            activeItem = (activeItem == item) ? nil : item
                        }
                    }
            }
        }
        .onPreferenceChange(PillPositionPreferenceKey.self) { frames in
            for (key, val) in frames {
                pillFrames[key] = val
            }
        }
    }
    
    // MARK: - Debounced Inter-Tab Hover Logic
    
    private func handleHover(for item: ThemeItem, isHovering: Bool) {
        if isHovering {
            dismissTask?.cancel()
            dismissTask = nil
            withAnimation(glideSpring) {
                activeItem = item
            }
        } else if activeItem == item {
            dismissTask?.cancel()
            dismissTask = Task {
                try? await Task.sleep(nanoseconds: 140_000_000)
                if !Task.isCancelled {
                    await MainActor.run {
                        withAnimation(glideSpring) {
                            activeItem = nil
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Floating Preview Card

struct FloatingPreviewCard: View {
    let item: ThemeItem
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.12), radius: 22, x: 0, y: 12)
                .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
            
            // Continuous icon morphing
            Image(systemName: item.icon)
                .font(.system(size: 42, weight: .semibold))
                .foregroundStyle(item.tint)
                .symbolRenderingMode(.hierarchical)
                .id(item.id)
                .transition(
                    .asymmetric(
                        insertion: .scale(scale: 0.85).combined(with: .opacity),
                        removal: .scale(scale: 1.08).combined(with: .opacity)
                    )
                )
        }
        .frame(width: 98, height: 98)
    }
}

// MARK: - PreferenceKey

struct PillPositionPreferenceKey: PreferenceKey {
    static var defaultValue: [String: CGRect] = [:]
    static func reduce(value: inout [String: CGRect], nextValue: () -> [String: CGRect]) {
        value.merge(nextValue()) { $1 }
    }
}

// MARK: - Preview

#Preview {
    FloatingPreviewChipsView()
}
