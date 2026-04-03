import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FloatingNavComponent } from '../../shared/components/floating-nav/floating-nav.component';

interface ServiceCard {
    id: number;
    title: string;
    description: string;
    images: string[];
    currentImage: number;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FloatingNavComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    sectionIds = ['hero', 'services', 'about', 'contact'];

    heroImages = [
        'assets/images/hero/hero1.png',
        'assets/images/hero/hero2.png',
        'assets/images/hero/hero3.png',
    ];

    serviceCards: ServiceCard[] = [
        {
            id: 1,
            title: 'Web Platform Development',
            description: 'Custom web applications built with cutting-edge technologies for maximum performance and scalability.',
            images: ['assets/images/services/service1.png', 'assets/images/services/service2.png'],
            currentImage: 0
        },
        {
            id: 2,
            title: 'Mobile App Design',
            description: 'Beautiful native and cross-platform mobile applications that deliver exceptional user experiences.',
            images: ['assets/images/services/service2.png', 'assets/images/services/service1.png'],
            currentImage: 0
        },
        {
            id: 3,
            title: 'Cloud Infrastructure',
            description: 'Scalable cloud solutions with automatic scaling, monitoring, and enterprise-grade security.',
            images: ['assets/images/services/service1.png', 'assets/images/services/service2.png'],
            currentImage: 0
        },
        {
            id: 4,
            title: 'AI & Data Analytics',
            description: 'Intelligent data processing and analytics powered by machine learning algorithms.',
            images: ['assets/images/services/service2.png', 'assets/images/services/service1.png'],
            currentImage: 0
        },
        {
            id: 5,
            title: 'UI/UX Design Systems',
            description: 'Comprehensive design systems that ensure consistency and accelerate product development.',
            images: ['assets/images/services/service1.png', 'assets/images/services/service2.png'],
            currentImage: 0
        },
        {
            id: 6,
            title: 'DevOps & Automation',
            description: 'Streamlined CI/CD pipelines and infrastructure automation for faster deployments.',
            images: ['assets/images/services/service2.png', 'assets/images/services/service1.png'],
            currentImage: 0
        }
    ];

    contactForm = { name: '', email: '', subject: '', message: '' };

    stats = [
        { value: '500+', label: 'Projects Delivered' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '50+', label: 'Team Members' },
        { value: '24/7', label: 'Support Available' }
    ];

    ngOnInit(): void { }

    prevImage(card: ServiceCard): void {
        card.currentImage = card.currentImage > 0 ? card.currentImage - 1 : card.images.length - 1;
    }

    nextImage(card: ServiceCard): void {
        card.currentImage = card.currentImage < card.images.length - 1 ? card.currentImage + 1 : 0;
    }

    submitContact(): void {
        console.log('Contact form submitted:', this.contactForm);
        this.contactForm = { name: '', email: '', subject: '', message: '' };
    }
}
