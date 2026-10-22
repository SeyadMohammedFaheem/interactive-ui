import SwiftUI

struct ViewOnMapMorphView: View {
    @State private var isExpanded: Bool = false
    @State private var dragOffset: CGSize = .zero
    @Namespace private var mapAnimation
    
    // Snappy spring curve matching Nitish Khagwal's pill-to-square animation
    private let spring: Animation = .spring(response: 0.42, dampingFraction: 0.8, blendDuration: 0)
    
    var body: some View {
        ZStack {
            Color.white
                .ignoresSafeArea()
            
            // Dimmed backdrop
            if isExpanded {
                Color.black.opacity(0.16)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(spring) {
                            isExpanded = false
                            dragOffset = .zero
                        }
                    }
                    .transition(.opacity)
            }
            
            // Shared-Element Morph Container
            ZStack {
                if !isExpanded {
                    // Collapsed Pill Button matching reference screenshot (224 x 58)
                    HStack(spacing: 12) {
                        Image(systemName: "map.fill")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(Color(hex: "4A4E5A"))
                        
                        Text("View on Map")
                            .font(.custom("PlusJakartaSans-SemiBold", size: 17))
                            .foregroundColor(Color(hex: "1C1F26"))
                    }
                    .padding(.horizontal, 22)
                    .frame(width: 224, height: 58)
                    .background(Color(hex: "E9EAF2"))
                    .clipShape(Capsule())
                    .matchedGeometryEffect(id: "mapCard", in: mapAnimation)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, y: 2)
                    .onTapGesture {
                        withAnimation(spring) {
                            isExpanded = true
                        }
                    }
                } else {
                    // Expanded Square Map View (326 x 326, corner radius 38)
                    ZStack(alignment: .topTrailing) {
                        // Monochromatic Map Canvas Area
                        Color(hex: "EBECEF")
                            .overlay(
                                // Big Belly Burger Pin & Badge
                                VStack(spacing: 4) {
                                    ZStack {
                                        Circle()
                                            .fill(Color(hex: "242731"))
                                            .frame(width: 32, height: 32)
                                            .shadow(color: Color.black.opacity(0.22), radius: 8, y: 4)
                                        
                                        Circle()
                                            .fill(Color.white)
                                            .frame(width: 10, height: 10)
                                    }
                                    
                                    Text("Big Belly Burger")
                                        .font(.custom("PlusJakartaSans-Bold", size: 13))
                                        .foregroundColor(Color(hex: "0F172A"))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 5)
                                        .background(Color.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                        .shadow(color: Color.black.opacity(0.14), radius: 6, y: 3)
                                }
                                .offset(dragOffset)
                            )
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        dragOffset = value.translation
                                    }
                                    .onEnded { _ in
                                        withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                                            dragOffset = .zero
                                        }
                                    }
                            )
                        
                        // Floating Close Button (✕)
                        Button {
                            withAnimation(spring) {
                                isExpanded = false
                                dragOffset = .zero
                            }
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(Color(hex: "475569"))
                                .frame(width: 36, height: 36)
                                .background(Color.white)
                                .clipShape(Circle())
                                .shadow(color: Color.black.opacity(0.14), radius: 6, y: 2)
                        }
                        .padding(16)
                    }
                    .frame(width: 326, height: 326)
                    .clipShape(RoundedRectangle(cornerRadius: 38, style: .continuous))
                    .matchedGeometryEffect(id: "mapCard", in: mapAnimation)
                    .shadow(color: Color.black.opacity(0.18), radius: 24, y: 12)
                }
            }
        }
    }
}

#Preview {
    ViewOnMapMorphView()
}
