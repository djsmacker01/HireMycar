import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces
interface FooterLink {
  id: string;
  label: string;
  path: string;
  external?: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  // Footer Sections
  footerSections: FooterSection[] = [
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: 'about', label: 'About Us', path: '/about' },
        { id: 'careers', label: 'Careers', path: '/careers' },
        { id: 'press', label: 'Press', path: '/press' },
        { id: 'contact', label: 'Contact', path: '/contact' }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      links: [
        { id: 'help', label: 'Help Center', path: '/help' },
        { id: 'safety', label: 'Safety', path: '/safety' },
        { id: 'trust', label: 'Trust & Safety', path: '/trust' },
        { id: 'community', label: 'Community', path: '/community' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: 'terms', label: 'Terms of Service', path: '/terms' },
        { id: 'privacy', label: 'Privacy Policy', path: '/privacy' },
        { id: 'cookies', label: 'Cookie Policy', path: '/cookies' },
        { id: 'accessibility', label: 'Accessibility', path: '/accessibility' }
      ]
    },
    {
      id: 'business',
      title: 'Business',
      links: [
        { id: 'partners', label: 'Partners', path: '/partners' },
        { id: 'enterprise', label: 'Enterprise', path: '/enterprise' },
        { id: 'api', label: 'API', path: '/api', external: true },
        { id: 'developers', label: 'Developers', path: '/developers' }
      ]
    }
  ];

  // Social Media Links
  socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      label: 'Facebook',
      url: 'https://facebook.com/hiremycar',
      icon: '📘'
    },
    {
      id: 'twitter',
      label: 'Twitter',
      url: 'https://twitter.com/hiremycar',
      icon: '🐦'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com/hiremycar',
      icon: '📷'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com/company/hiremycar',
      icon: '💼'
    },
    {
      id: 'youtube',
      label: 'YouTube',
      url: 'https://youtube.com/hiremycar',
      icon: '📺'
    }
  ];

  // App Download Links
  appLinks = [
    {
      id: 'app-store',
      label: 'App Store',
      url: '#',
      icon: '🍎'
    },
    {
      id: 'google-play',
      label: 'Google Play',
      url: '#',
      icon: '🤖'
    }
  ];

  // Newsletter Subscription
  newsletterEmail = '';

  // Current Year
  currentYear = new Date().getFullYear();

  // Scroll State
  isScrolled = false;

  // Methods
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail.trim()) {
      // In a real app, you'd send this to your backend
      console.log('Newsletter subscription:', this.newsletterEmail);
      this.newsletterEmail = '';
      this.showNotification('Thank you for subscribing to our newsletter!', 'success');
    }
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // In a real app, you'd use a notification service
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Track by functions for ngFor
  trackBySectionId(index: number, section: FooterSection): string {
    return section.id;
  }

  trackByLinkId(index: number, link: FooterLink): string {
    return link.id;
  }

  trackBySocialId(index: number, social: SocialLink): string {
    return social.id;
  }

  trackByAppId(index: number, app: any): string {
    return app.id;
  }

  // Lifecycle hooks
  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 300;
  }
} 