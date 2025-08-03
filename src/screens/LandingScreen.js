// src/screens/LandingScreen.js
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';

const LandingScreen = ({ onGetStarted }) => {
  const features = [
    {
      icon: 'checkbox-marked-outline',
      title: 'Smart Task Management',
      description: 'Organize tasks with difficulty levels and energy requirements designed for neurodivergent minds.',
      color: colors.secondary,
    },
    {
      icon: 'calendar-clock',
      title: 'Flexible Scheduling',
      description: 'Create routines that adapt to your needs with built-in flexibility and preparation time.',
      color: colors.tertiary,
    },
    {
      icon: 'wave',
      title: 'Sensory Support',
      description: 'Track sensory preferences and get personalized recommendations for comfortable environments.',
      color: colors.accent1,
    },
    {
      icon: 'brain',
      title: 'Cognitive Tools',
      description: 'Memory aids, planning support, and cognitive strategies tailored to your thinking style.',
      color: colors.focus,
    },
    {
      icon: 'message-text',
      title: 'Communication Aids',
      description: 'Pre-written templates and communication tools to help express yourself clearly.',
      color: colors.accent2,
    },
    {
      icon: 'timer-outline',
      title: 'Focus Sessions',
      description: 'Pomodoro timers and focus tracking designed for ADHD and attention differences.',
      color: colors.primary,
    },
  ];

  const testimonials = [
    {
      text: "Finally, an app that understands how my ADHD brain works!",
      author: "Sarah, ADHD Community Member",
    },
    {
      text: "The sensory tracking has been a game-changer for managing my autism.",
      author: "Alex, Autism Advocate",
    },
    {
      text: "Simple, calming design that doesn't overwhelm me.",
      author: "Jordan, Neurodiversity Supporter",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons 
              name="brain" 
              size={60} 
              color={colors.primary} 
            />
          </View>
          <Title style={styles.heroTitle}>NeuroEase</Title>
          <Paragraph style={styles.heroSubtitle}>
            Your personal neurodiversity assistant
          </Paragraph>
          <Paragraph style={styles.heroDescription}>
            Designed specifically for neurodivergent individuals to thrive in daily life with tools for task management, sensory support, and cognitive assistance.
          </Paragraph>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Title style={styles.sectionTitle}>Designed for Your Unique Mind</Title>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card key={index} style={styles.featureCard}>
                <Card.Content style={styles.featureContent}>
                  <View style={styles.featureHeader}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={32}
                      color={feature.color}
                    />
                    <Title style={styles.featureTitle}>{feature.title}</Title>
                  </View>
                  <Paragraph style={styles.featureDescription}>
                    {feature.description}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <Surface style={styles.benefitsSection}>
          <Title style={styles.sectionTitle}>Why NeuroEase?</Title>
          <View style={styles.benefitsList}>
            {[
              'Evidence-based design for neurodivergent needs',
              'Calming, accessible interface',
              'Personalized to your specific challenges',
              'Privacy-focused and secure',
              'Created by and for the neurodivergent community',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.success}
                />
                <Paragraph style={styles.benefitText}>{benefit}</Paragraph>
              </View>
            ))}
          </View>
        </Surface>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Title style={styles.sectionTitle}>What Our Community Says</Title>
          {testimonials.map((testimonial, index) => (
            <Card key={index} style={styles.testimonialCard}>
              <Card.Content>
                <Paragraph style={styles.testimonialText}>
                  "{testimonial.text}"
                </Paragraph>
                <Paragraph style={styles.testimonialAuthor}>
                  — {testimonial.author}
                </Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Card style={styles.ctaCard}>
            <Card.Content style={styles.ctaContent}>
              <Title style={styles.ctaTitle}>Ready to Get Started?</Title>
              <Paragraph style={styles.ctaDescription}>
                Join thousands of neurodivergent individuals who are thriving with NeuroEase. Your journey to better self-management starts here.
              </Paragraph>
              <Button
                mode="contained"
                onPress={onGetStarted}
                style={styles.ctaButton}
                buttonColor={colors.primary}
                contentStyle={styles.ctaButtonContent}
              >
                Get Started - It's Free
              </Button>
              <Paragraph style={styles.ctaSubtext}>
                • No credit card required
                • Complete privacy protection
                • Personalized setup in under 5 minutes
              </Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Paragraph style={styles.footerText}>
            Made with ❤️ for the neurodivergent community
          </Paragraph>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surface,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.subtext,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  featuresSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresGrid: {
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surface,
    elevation: 2,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  featureContent: {
    padding: spacing.md,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
  benefitsSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    elevation: 1,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  testimonialsSection: {
    padding: spacing.lg,
  },
  testimonialCard: {
    backgroundColor: colors.surface,
    elevation: 1,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'right',
  },
  ctaSection: {
    padding: spacing.lg,
  },
  ctaCard: {
    backgroundColor: colors.surface,
    elevation: 4,
    borderRadius: 16,
  },
  ctaContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaDescription: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  ctaButtonContent: {
    paddingVertical: spacing.sm,
  },
  ctaSubtext: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
  },
});

export default LandingScreen;
