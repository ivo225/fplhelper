'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to FPL Analytics. By accessing or using our website, you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access our service.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use of Our Services</h2>
          <p>
            Our services are designed to provide Fantasy Premier League managers with analytics, insights, and recommendations. 
            You agree to use our services only for lawful purposes and in accordance with these Terms.
          </p>
          <p className="mt-2">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Use our services in any way that violates any applicable laws or regulations</li>
            <li>Attempt to interfere with or disrupt the integrity or performance of our services</li>
            <li>Attempt to gain unauthorized access to our services or related systems</li>
            <li>Collect or harvest any information from our services without authorization</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p>
            When you provide your FPL ID to use our services, you are responsible for maintaining the confidentiality of your 
            account information and for all activities that occur under your account.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            The content, features, and functionality of our services, including but not limited to text, graphics, logos, 
            and software, are owned by FPL Analytics and are protected by copyright, trademark, and other intellectual 
            property laws.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Usage</h2>
          <p>
            We use data from the official Fantasy Premier League API to provide our services. Our use of this data is in 
            accordance with the Fantasy Premier League's terms of service. For more information on how we handle your data, 
            please refer to our Privacy Policy.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            FPL Analytics shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your access to or use of, or inability to access or use, our services.
          </p>
          <p className="mt-2">
            Our recommendations and insights are provided for informational purposes only and should not be construed as 
            professional advice. We make no guarantees regarding the accuracy or reliability of our predictions.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any significant changes by 
            updating the "Last updated" date at the top of these Terms.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@fplanalytics.com.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 