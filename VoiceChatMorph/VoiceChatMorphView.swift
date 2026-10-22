import SwiftUI

// MARK: - Participant Model

struct VoiceParticipant: Identifiable, Hashable {
    let id: String
    let name: String
    let avatarURL: String
    let isSpeaking: Bool
    let color: Color
}

// MARK: - Voice Chat Unified Continuous Morphing Component

struct VoiceChatMorphView: View {
    @State private var isExpanded: Bool = false
    @State private var isJoined: Bool = false
    
    // Sample participant data matching reference images
    let participants: [VoiceParticipant] = [
        VoiceParticipant(
            id: "oguz",
            name: "Oğuz",
            avatarURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            isSpeaking: true,
            color: .blue
        ),
        VoiceParticipant(
            id: "ashish",
            name: "Ashish",
            avatarURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
            isSpeaking: false,
            color: .purple
        ),
        VoiceParticipant(
            id: "mariana",
            name: "Mariana",
            avatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
            isSpeaking: false,
            color: .teal
        ),
        VoiceParticipant(
            id: "mds",
            name: "MDS",
            avatarURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
            isSpeaking: false,
            color: .black
        ),
        VoiceParticipant(
            id: "ana",
            name: "Ana",
            avatarURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            isSpeaking: false,
            color: .pink
        ),
        VoiceParticipant(
            id: "natko",
            name: "Natko",
            avatarURL: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
            isSpeaking: true,
            color: .indigo
        ),
        VoiceParticipant(
            id: "afshin",
            name: "Afshin",
            avatarURL: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
            isSpeaking: false,
            color: .orange
        )
    ]
    
    // Snappy physics spring configuration for fast, responsive, buttery-smooth fluid morphing
    private let springAnimation: Animation = .spring(
        response: 0.28,
        dampingFraction: 0.80,
        blendDuration: 0.02
    )
    
    var body: some View {
        ZStack {
            // Background Stage
            Color(hex: "F4F5F7")
                .ignoresSafeArea()
            
            // Dimmed Backdrop when expanded
            if isExpanded {
                Color.black.opacity(0.18)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(springAnimation) {
                            isExpanded = false
                        }
                    }
                    .transition(.opacity)
            }
            
            // THE SINGLE UNIFIED MORPHING WIDGET
            morphingCard
                .onTapGesture {
                    if !isExpanded {
                        withAnimation(springAnimation) {
                            isExpanded = true
                        }
                    }
                }
        }
    }
    
    // MARK: - Morphing Card
    
    private var morphingCard: some View {
        ZStack(alignment: .top) {
            
            // 1. Modal Header ("Voice Chat" + Close Button)
            if isExpanded {
                HStack {
                    Spacer()
                    
                    Text("Voice Chat")
                        .font(.custom("PlusJakartaSans-Bold", size: 19))
                        .foregroundColor(Color(hex: "1F2937"))
                        .padding(.leading, 32)
                    
                    Spacer()
                    
                    Button {
                        withAnimation(springAnimation) {
                            isExpanded = false
                        }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(hex: "9CA3AF"))
                            .frame(width: 32, height: 32)
                            .background(Color(hex: "F3F4F6"))
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 24)
                .padding(.top, 22)
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .offset(y: -8)),
                    removal: .opacity
                ))
            }
            
            // 2. Central Avatars Area
            VStack(spacing: 16) {
                // Spacer pushes avatars down into grid position when expanded
                if isExpanded {
                    Spacer()
                        .frame(height: 54)
                }
                
                // Row 1: The 4 Core Avatars (Smoothly glide between stacked and spaced grid)
                HStack(spacing: isExpanded ? 18 : -14) {
                    ForEach(Array(participants.prefix(4).enumerated()), id: \.element.id) { index, person in
                        participantItem(person: person, showSpeakingBadge: isExpanded && person.isSpeaking)
                            .zIndex(Double(10 - index))
                    }
                }
                .padding(.leading, isExpanded ? 0 : 8)
                
                // Row 2: Additional Participants (Slide down when expanded)
                if isExpanded {
                    HStack(spacing: 18) {
                        ForEach(participants.dropFirst(4)) { person in
                            participantItem(person: person, showSpeakingBadge: person.isSpeaking)
                        }
                        
                        // 4th empty spacer for balanced 4-column layout
                        Color.clear
                            .frame(width: 58, height: 82)
                    }
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .offset(y: -20)).combined(with: .scale(scale: 0.85)),
                        removal: .opacity.combined(with: .offset(y: -10))
                    ))
                }
                
                // 3. Action Section ("Join Now" button + subtitle)
                if isExpanded {
                    VStack(spacing: 12) {
                        Button {
                            withAnimation(springAnimation) {
                                isJoined.toggle()
                            }
                        } label: {
                            Text(isJoined ? "✓ Connected" : "Join Now")
                                .font(.custom("PlusJakartaSans-Bold", size: 16))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(isJoined ? Color(hex: "10B981") : Color(hex: "111827"))
                                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                .shadow(color: Color.black.opacity(0.12), radius: 8, x: 0, y: 4)
                        }
                        .buttonStyle(.plain)
                        
                        Text("Mic will be muted initially.")
                            .font(.custom("PlusJakartaSans-Medium", size: 13.5))
                            .foregroundColor(Color(hex: "9CA3AF"))
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 8)
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .offset(y: 16)),
                        removal: .opacity
                    ))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: isExpanded ? .top : .center)
            
            // 4. Overlays in Collapsed Pill State:
            // (a) Floating Dark Mic Badge (top-left)
            if !isExpanded {
                SpeakingWaveBadge(isDark: true, size: 44)
                    .offset(x: -12, y: -12)
                    .transition(.scale(scale: 0.6).combined(with: .opacity))
            }
            
            // (b) "+3 ⌄" Count Badge (right side)
            if !isExpanded {
                HStack(spacing: 7) {
                    Text("+3")
                        .font(.custom("PlusJakartaSans-SemiBold", size: 24))
                        .foregroundColor(Color(hex: "717680"))
                    
                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(Color(hex: "717680"))
                        .offset(y: 1)
                }
                .padding(.trailing, 28)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                .transition(.scale(scale: 0.7).combined(with: .opacity))
            }
        }
        // Continuous animated bounds and rounded corners
        .frame(width: isExpanded ? 360 : 300, height: isExpanded ? 426 : 76)
        .background(
            RoundedRectangle(cornerRadius: isExpanded ? 32 : 38, style: .continuous)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(isExpanded ? 0.14 : 0.08), radius: isExpanded ? 32 : 20, x: 0, y: isExpanded ? 14 : 6)
                .border(Color.black.opacity(0.03), width: 1)
        )
        .animation(springAnimation, value: isExpanded)
    }
    
    // MARK: - Participant Item View
    
    private func participantItem(person: VoiceParticipant, showSpeakingBadge: Bool) -> some View {
        VStack(spacing: 8) {
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: person.avatarURL)) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .scaledToFill()
                    } else {
                        Circle()
                            .fill(person.color.opacity(0.8))
                    }
                }
                .frame(width: 58, height: 58)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 3)
                )
                .shadow(color: Color.black.opacity(0.07), radius: 6, x: 0, y: 3)
                
                if showSpeakingBadge {
                    SpeakingWaveBadge(isDark: false, size: 22)
                        .offset(x: 4, y: -4)
                        .transition(.scale(scale: 0.6).combined(with: .opacity))
                }
            }
            
            // Name label (only visible when expanded)
            if isExpanded {
                Text(person.name)
                    .font(.custom("PlusJakartaSans-SemiBold", size: 14))
                    .foregroundColor(Color(hex: "334155"))
                    .lineLimit(1)
                    .transition(.opacity.combined(with: .offset(y: -4)))
            }
        }
        .frame(width: 58)
    }
}

// MARK: - Animated Speaking Wave Badge

struct SpeakingWaveBadge: View {
    let isDark: Bool
    let size: CGFloat
    
    @State private var waveStep: Bool = false
    
    var body: some View {
        ZStack {
            Circle()
                .fill(isDark ? Color(hex: "1F2026") : Color.white)
                .frame(width: size, height: size)
                .shadow(color: Color.black.opacity(0.14), radius: 4, x: 0, y: 2)
            
            HStack(spacing: size * 0.07) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDark ? Color.white : Color(hex: "1E293B"))
                    .frame(width: size * 0.08, height: waveStep ? size * 0.45 : size * 0.22)
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDark ? Color.white : Color(hex: "1E293B"))
                    .frame(width: size * 0.08, height: waveStep ? size * 0.25 : size * 0.55)
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDark ? Color.white : Color(hex: "1E293B"))
                    .frame(width: size * 0.08, height: waveStep ? size * 0.50 : size * 0.30)
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDark ? Color.white : Color(hex: "1E293B"))
                    .frame(width: size * 0.08, height: waveStep ? size * 0.20 : size * 0.40)
            }
            .animation(.easeInOut(duration: 0.45).repeatForever(autoreverses: true), value: waveStep)
        }
        .onAppear {
            waveStep = true
        }
    }
}

// MARK: - Color Hex Extension Helper

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    VoiceChatMorphView()
}
