import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isExpanded: boolean;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: number;
}

interface ContactInfo {
  type: string;
  value: string;
  icon: string;
  link?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'faq' | 'article' | 'category';
  category?: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedCategory = 'all';
  expandedFAQ: string | null = null;
  showSuggestions = false;
  searchSuggestions: SearchSuggestion[] = [];
  recentSearches: string[] = [];
  popularTopics: string[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Help Categories
  helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn how to use HireMyCar for the first time',
      icon: '🚀',
      articles: 8
    },
    {
      id: 'booking',
      title: 'Booking & Rentals',
      description: 'Everything about booking and managing rentals',
      icon: '📅',
      articles: 12
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      description: 'Payment methods, billing, and refunds',
      icon: '💳',
      articles: 6
    },
    {
      id: 'car-owners',
      title: 'For Car Owners',
      description: 'How to list and manage your car',
      icon: '📋',
      articles: 10
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      description: 'Safety guidelines and security measures',
      icon: '🛡️',
      articles: 7
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'App issues and technical problems',
      icon: '🔧',
      articles: 5
    }
  ];

  // FAQ Data
  faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create an account on HireMyCar?',
      answer: 'Creating an account is easy! Click the "Sign Up" button in the top right corner, choose whether you want to rent cars or list your car, fill in your details, and verify your email address. You\'ll be ready to start using HireMyCar in minutes.',
      category: 'getting-started',
      isExpanded: false
    },
    {
      id: '2',
      question: 'What documents do I need to rent a car?',
      answer: 'To rent a car, you need a valid driver\'s license, a government-issued ID, and a credit card for payment. Some car owners may require additional documents like proof of insurance or a driving record.',
      category: 'booking',
      isExpanded: false
    },
    {
      id: '3',
      question: 'How do I list my car for rent?',
      answer: 'Go to your dashboard and click "List Your Car". Fill in your car\'s details including make, model, year, photos, and daily rate. Once approved, your car will be available for rent on our platform.',
      category: 'car-owners',
      isExpanded: false
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and bank transfers. All payments are processed securely through our encrypted payment system.',
      category: 'payments',
      isExpanded: false
    },
    {
      id: '5',
      question: 'How do I cancel a booking?',
      answer: 'You can cancel a booking up to 24 hours before the rental start time through your dashboard. Cancellation fees may apply depending on how close to the rental date you cancel.',
      category: 'booking',
      isExpanded: false
    },
    {
      id: '6',
      question: 'Is my car insured when I rent it out?',
      answer: 'Yes! All cars listed on HireMyCar are covered by our comprehensive insurance policy. This includes liability coverage, collision coverage, and protection against theft and vandalism.',
      category: 'safety',
      isExpanded: false
    },
    {
      id: '7',
      question: 'What if there\'s damage to the car during rental?',
      answer: 'If damage occurs during rental, report it immediately through the app. We have a 24/7 support team and insurance claims process to handle any incidents quickly and fairly.',
      category: 'safety',
      isExpanded: false
    },
    {
      id: '8',
      question: 'How do I contact customer support?',
      answer: 'You can reach our support team 24/7 through the in-app chat, email at support@hiremycar.com.ng, or phone at +234-800-HIRE-CAR. We typically respond within 2 hours.',
      category: 'technical',
      isExpanded: false
    },
    {
      id: '9',
      question: 'Can I extend my rental period?',
      answer: 'Yes! You can extend your rental through the app if the car is available. Simply go to your booking details and click "Extend Rental". Additional charges will apply.',
      category: 'booking',
      isExpanded: false
    },
    {
      id: '10',
      question: 'What are the age requirements for renting?',
      answer: 'You must be at least 21 years old to rent a car on HireMyCar. Some car owners may have additional age requirements (typically 25+ for luxury vehicles).',
      category: 'booking',
      isExpanded: false
    }
  ];

  // Contact Information
  contactInfo: ContactInfo[] = [
    {
      type: 'Phone',
      value: '+234-800-HIRE-CAR',
      icon: '📞',
      link: 'tel:+2348004473227'
    },
    {
      type: 'Email',
      value: 'support@hiremycar.com.ng',
      icon: '📧',
      link: 'mailto:support@hiremycar.com.ng'
    },
    {
      type: 'WhatsApp',
      value: '+234-800-HIRE-CAR',
      icon: '💬',
      link: 'https://wa.me/2348004473227'
    },
    {
      type: 'Address',
      value: '123 Victoria Island, Lagos, Nigeria',
      icon: '📍'
    }
  ];

  // Business Hours
  businessHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Emergency Support', hours: '24/7 Available' }
  ];

  // Contact Form
  contactForm = {
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium'
  };

  isSubmitting = false;
  submitSuccess = false;

  // Help Articles
  helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'How to Create Your First Account',
      content: 'Creating an account on HireMyCar is simple and takes just a few minutes. Follow these steps to get started...',
      category: 'getting-started',
      tags: ['account', 'signup', 'registration'],
      helpful: 45,
      notHelpful: 2,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Understanding Rental Policies',
      content: 'Our rental policies are designed to ensure a safe and fair experience for both renters and car owners...',
      category: 'booking',
      tags: ['policies', 'rental', 'terms'],
      helpful: 38,
      notHelpful: 1,
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      title: 'Payment Methods and Security',
      content: 'We accept various payment methods and ensure all transactions are secure and encrypted...',
      category: 'payments',
      tags: ['payment', 'security', 'billing'],
      helpful: 52,
      notHelpful: 0,
      lastUpdated: '2024-01-12'
    }
  ];

  ngOnInit(): void {
    this.initializeSearch();
    this.loadRecentSearches();
    this.loadPopularTopics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.isLoading = true;
    
    // Simulate API call delay
    setTimeout(() => {
      this.searchSuggestions = this.generateSearchSuggestions(query);
      this.showSuggestions = this.searchSuggestions.length > 0;
      this.isLoading = false;
    }, 200);
  }

  private generateSearchSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in FAQs
    this.faqs.forEach(faq => {
      if (faq.question.toLowerCase().includes(lowerQuery) || 
          faq.answer.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          id: `faq-${faq.id}`,
          text: faq.question,
          type: 'faq',
          category: faq.category
        });
      }
    });

    // Search in help articles
    this.helpArticles.forEach(article => {
      if (article.title.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery) ||
          article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        suggestions.push({
          id: `article-${article.id}`,
          text: article.title,
          type: 'article',
          category: article.category
        });
      }
    });

    // Search in categories
    this.helpCategories.forEach(category => {
      if (category.title.toLowerCase().includes(lowerQuery) ||
          category.description.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          id: `category-${category.id}`,
          text: category.title,
          type: 'category',
          category: category.id
        });
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private loadRecentSearches(): void {
    // Load from localStorage or API
    const saved = localStorage.getItem('hiremycar-recent-searches');
    this.recentSearches = saved ? JSON.parse(saved) : [
      'How to book a car',
      'Payment methods',
      'Car owner registration',
      'Safety guidelines'
    ];
  }

  private loadPopularTopics(): void {
    // Load from API or analytics
    this.popularTopics = [
      'Account setup',
      'Booking process',
      'Payment issues',
      'Car listing',
      'Safety policies',
      'Technical support'
    ];
  }

  private saveRecentSearch(query: string): void {
    if (!query.trim()) return;
    
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    // Add to beginning
    this.recentSearches.unshift(query);
    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('hiremycar-recent-searches', JSON.stringify(this.recentSearches));
  }

  // Enhanced search functionality
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject$.next(this.searchQuery);
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim()) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.text;
    this.showSuggestions = false;
    this.saveRecentSearch(suggestion.text);
    
    // Navigate to relevant section
    if (suggestion.type === 'category') {
      this.selectedCategory = suggestion.category || 'all';
    } else if (suggestion.type === 'faq') {
      // Find and expand the FAQ
      const faqId = suggestion.id.replace('faq-', '');
      this.expandedFAQ = faqId;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSuggestions = [];
    this.showSuggestions = false;
  }

  selectRecentSearch(search: string): void {
    this.searchQuery = search;
    this.onSearchInput({ target: { value: search } } as any);
  }

  selectPopularTopic(topic: string): void {
    this.searchQuery = topic;
    this.onSearchInput({ target: { value: topic } } as any);
  }

  get filteredFAQs(): FAQ[] {
    let filtered = this.faqs;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get filteredArticles(): HelpArticle[] {
    let filtered = this.helpArticles;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  // FAQ methods
  toggleFAQ(faqId: string): void {
    this.expandedFAQ = this.expandedFAQ === faqId ? null : faqId;
  }

  // Category methods
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.scrollToFAQs();
  }

  private scrollToFAQs(): void {
    // Smooth scroll to FAQ section
    setTimeout(() => {
      const faqSection = document.getElementById('faq-section');
      if (faqSection) {
        faqSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }

  // Feedback methods
  markArticleHelpful(articleId: string): void {
    const article = this.helpArticles.find(a => a.id === articleId);
    if (article) {
      article.helpful++;
      // In real app, send to API
      this.saveFeedback(articleId, 'helpful');
    }
  }

  markArticleNotHelpful(articleId: string): void {
    const article = this.helpArticles.find(a => a.id === articleId);
    if (article) {
      article.notHelpful++;
      // In real app, send to API
      this.saveFeedback(articleId, 'not-helpful');
    }
  }

  private saveFeedback(articleId: string, feedback: string): void {
    // Save feedback to localStorage or send to API
    const feedbacks = JSON.parse(localStorage.getItem('hiremycar-feedbacks') || '{}');
    feedbacks[articleId] = feedback;
    localStorage.setItem('hiremycar-feedbacks', JSON.stringify(feedbacks));
  }

  // Enhanced contact form methods
  onSubmitContactForm(): void {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      
      // Simulate form submission with real validation
      const formData = {
        ...this.contactForm,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In real app, send to API
      console.log('Contact form submitted:', formData);
      
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.resetForm();
        
        // Track form submission
        this.trackContactSubmission(formData);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      }, 2000);
    }
  }

  private trackContactSubmission(formData: any): void {
    // Track contact form submissions for analytics
    const submissions = JSON.parse(localStorage.getItem('hiremycar-contact-submissions') || '[]');
    submissions.push(formData);
    localStorage.setItem('hiremycar-contact-submissions', JSON.stringify(submissions));
  }

  isFormValid(): boolean {
    return !!(
      this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.subject &&
      this.contactForm.message
    );
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
      priority: 'medium'
    };
  }

  // Utility methods
  getCategoryIcon(categoryId: string): string {
    const category = this.helpCategories.find(cat => cat.id === categoryId);
    return category?.icon || '❓';
  }

  getCategoryTitle(categoryId: string): string {
    const category = this.helpCategories.find(cat => cat.id === categoryId);
    return category?.title || 'General';
  }
}
