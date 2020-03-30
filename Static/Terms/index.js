import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { injectIntl, intlShape } from 'react-intl'
import m from 'commons/I18n/'

import ax from 'commons/Services/Analytics/index'

import MarketingHeader from '../components/MarketingHeader/'

export const TermsContent = p => (
  <div>
    <p>Last revised 2017-05-03</p>
    <p>Here are the ground rules if you're using our stuff. The following Terms of Service ("Terms," "Agreement") govern your use of TrustCor Systems S. de R.L. websites, products, applications, tools, and services (collectively referred to as our "Site and Services").</p>
    <p>We help protect your privacy. Our Site and Services allows a user ("user" or "you") to manage your online privacy and your personal information by controlling how other websites and businesses display or collect such personal information, and how you communicate on the Internet. These Terms of Service describe the terms and conditions on which TrustCor Systems provides our Site and Services to you. For more information about how our products and services work, please contact us.</p>
    <p>If something doesn't appear to be working correctly, contact us any time and we'll make it right. Write to us at <a href="mailto:support@msgsafe.support">support@msgsafe.support</a> or <a href="http://help.msgsafe.io/support/tickets/new">open a ticket</a> for help. If you would like to send us questions with encryption, you can use our public <a href='/keys/support@msgsafe.support_gpg-public.asc' target='_blank'>S/MIME</a> or <a href='/keys/support@msgsafe.support_smime-public.asc' target='_blank'>PGP</a> keys.</p>
    <p>Legal policies can be tedious, but please read up. We'll strive to make our policies understandable. READ THIS AGREEMENT CAREFULLY. IF YOU ACCEPT THIS AGREEMENT OR USE OUR SITE OR SERVICES, YOU ARE ENTERING INTO THIS AGREEMENT WITH TRUSTCOR SYSTEMS S. DE R.L. OF PANAMA. THIS IS A LEGALLY BINDING AGREEMENT. If you don't agree to these terms and conditions, you aren't permitted to use TrustCor Systems's Site or Services.</p>
    <p>Things could change. We may amend or terminate any terms of this Agreement at any time and such amendment or termination will be effective at the time we post the revised terms on the site. We'll strive to make these terms understandable. You can tell when we last revised this agreement by looking at the "last revised" date at the top of this Agreement. Your continued use of the site or services after we've posted revised terms signifies your acceptance of the revised terms.</p>
    <p>Tell the truth (when we need you to). Some of TrustCor Systems's products don't collect any of your personal information whatsoever. For others, like MsgSafe.io, we need your email address to assist protected communication, and we need to know that it's actually yours.</p>
    <p>We'll try hard. TrustCor Systems's Services allow users and subscribers like you to seek greater control over your communication and personal information online, including but not limited to by blocking software tracking; remove or suppress your personal information from communications; forwarding safer, masked emails to your personal email account; and encrypting and storing your logins and passwords. You recognize that TrustCor Systems will use good faith, reasonable efforts to help you accomplish these privacy goals, but that we cannot guarantee that third parties will not devise new tracking technologies that we are not aware of, among other things. We can't guarantee that this service will eliminate or control the collection, use, or sharing of your online data. We don't provide legal advice, so please don't rely on our service for legal guidance.</p>
    <p>It's unlikely, but bad things could happen. You acknowledge that your use of the TrustCor Systems Site and Services may have unintended consequences, possibly including direct, special, indirect, consequential and other damages, and you agree that you won't hold TrustCor Systems liable for these consequences.</p>
    <p>Don't sue us because of our products. You will indemnify and hold harmless TrustCor Systems S. de R.L., its parents, subsidiaries, customers, vendors, officers, and employees from any liability, damage or cost from any claim or demand associated with your use of our Site or Services, including direct and any third-party claims or demands.</p>
    <p>If something crazy happens, it's not our fault. You acknowledge that TrustCor Systems will not be liable for any failure to comply with these Terms to the extent that such failure arises from factors outside TrustCor Systems's reasonable control, like natural disasters.</p>
    <p>Privacy is key. TrustCor Systems is dedicated to consumer privacy rights and operates our Site and Services under our privacy policy. We urge you to read that policy now and revisit occasionally because we may update it.</p>
    <p>Please don't steal our stuff. All the text, images, marks, logos, compilations (meaning the collection, arrangement, and assembly of information) and other content on TrustCor Systems's website ("Site Content"), and all software embodied in TrustCor Systems's website, applications, or otherwise ("Software") used by us to deliver the Services is proprietary to us. Except as otherwise expressly permitted by these Terms, any use, redistribution, sale, decompilation, reverse engineering, disassembly, translation, or other reduction of such software to human-readable form is prohibited. The text marks "TRUSTCOR," "TRUSTCOR SYSTEMS," "MSGSAFE.IO," "MSGSAFE," "MESSAGESAFE" and "MESSAGESAFE.IO" as well as their associated logos, are our trademarks, and you may not use them in connection with any service or products other than those we provide in any manner that is likely to cause confusion among customers, or in any manner that disparages or discredits TrustCor Systems (although we're happy to have you use our Site Content for noncommercial, educational, or news-related use if you properly attribute it to us). Any use of such marks will apply to the benefit of their respective owners.</p>
    <p>Use our tools and services for good, not evil, or we'll kick you out. We don't allow our Site or Services to be used for illegal activities or activities that we find improper for any reason whatsoever. We reserve the right to take preventative or corrective actions to protect ourselves and our users from anyone's unacceptable use. Your failure to comply with our Terms may result in us terminating your access to and use of our site and services. You are not to:</p>
    <ul>
      <li>Impersonate anyone, falsely state or otherwise misrepresent your affiliation with any person or entity, or knowingly provide any fraudulent, misleading, or inaccurate information;</li>
      <li>Defame, abuse, harass, stalk, threaten, or otherwise violate others' rights, including without limitation others' privacy rights or rights of publicity;</li>
      <li>Access or use (or attempt to access or use) another user's account without permission;</li>
      <li>Transmit any software or materials that contain any viruses, worms, trojan horses, defects, or other items or computer code of a destructive nature;</li>
      <li>Modify, adapt, sublicense, translate, sell, reverse engineer, decompile, or disassemble any portion of the site or services;</li>
      <li>"Frame" or "mirror" any portion of the Site or Services;</li>
      <li>Use any robot, spider, site search/retrieval application, or other manual or automatic device or process to retrieve, index, data mine, or in any way reproduce or circumvent the navigational structure or presentation of our site or services;</li>
      <li>Harvest or collect any other users' information from the site or our services;</li>
      <li>Use our site or services for any illegal activity; or</li>
      <li>Probe, scan or test the vulnerability of our site or services, breach their security or authentication measures, or take any action that imposes an unreasonable or disproportionately large load on our site infrastructure.</li>
    </ul>
    <p>Data collectors and trackers change, so our services will change too. You acknowledge that our privacy services often include our blocking or interacting with third parties like advertisers, and that therefore our services will evolve when these third parties' methods and processes change. For example, the online trackers our software blocks change as advertisers develop new tracking techniques and form new companies.  As such, our Site and Services are provided on an "as is" basis, without warranties of any kind, either express or implied, including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. You agree that in any event, TrustCor Systems's liability is limited to fees you actually paid to us.</p>
    <p>We'll charge you for your premium subscriptions. If you're using one of our premium products or features, you acknowledge that you're registering for a recurring subscription and will be automatically billed at the end of the subscription billing cycle.</p>
    <p>You can cancel your premium subscriptions at any time. You have the right to cancel your premium subscriptions at any time, for any reason, and can do so by emailing us or calling us. If you choose to cancel, you will not be charged for any billing period beyond the one in which you canceled. This refund policy does not apply if we've terminated your account for misuse outlined in this Agreement. Any termination of your use of our services, whether initiated by you or by TrustCor Systems, won't affect any of your or TrustCor Systems's rights and obligations under these Terms that have arisen before the effective date of such termination.</p>
    <p>We're from Panama, so that's where we'll go to court if we ever get on each other's nerves. You and TrustCor Systems S. de R.L. agree that all matters arising from or relating to the use and operation of our site or services will be governed by the substantive laws of Panama. You agree that all claims you may have arising from or relating to the operation, use, or other exploitation of TrustCor Systems's Site or Services will be heard and resolved in courts located in Panama. You consent to the personal jurisdiction of such courts over you, stipulate to the fairness and convenience of proceeding in such courts, and covenant not to assert any object to proceeding in such courts. If you choose to gain access to our site or services from locations other than Panama, which is likely, you will also be responsible for complying with all local laws of any such other location.</p>
    <p>If you have any questions about this policy, please contact us at legal@msgsafe.support.</p>
    <p><b>Your use of our Sites and Services is subject to these terms and conditions.</b></p>
    <br />
    <div className='terms__keys'>
      <strong>MsgSafe.io Support</strong><br />
      <a href='mailto:support@msgsafe.support'>support@msgsafe.support</a><br /><br />
      GPG (<a href='/keys/support@msgsafe.support_gpg-public.asc' target='_blank'>download</a>)<br />
      <span className='terms__keys__fingerprint'>1B53 7F4C A71A 06D6 1758 BEAA 37DE DD44 4BB6 8AB9</span><br /><br />
      S/MIME (<a href='/keys/support@msgsafe.support_smime-public.asc' target='_blank'>download</a>)<br />
      <span className='terms__keys__fingerprint'>82B7 D737 D62F 6D66 1E78 D1CF B035 48F3 56DA 8A5B</span>
    </div>
  </div>
)

export class Terms extends Component {

  static propTypes = {
    intl: intlShape
  }

  componentDidMount () {
    ax.pageView(ax.EVENTS.TERMS)
  }

  render () {
    const fm = this.props.intl.formatMessage
    return (
      <div className='terms-privacy-container blue-gradient-bg'>
        <div className='blue-gradient-bg-bottom' />
        <Helmet>
          <title>{fm(m.app.Terms.seoTitle)}</title>
          <meta name='description' content={fm(m.app.Terms.seoDescription)} />
          <meta name='og:title' content={fm(m.app.Terms.seoTitle)} />
          <meta name='og:description' content={fm(m.app.Terms.seoDescription)} />
          <meta name='twitter:title' content={fm(m.app.Terms.seoTitle)} />
          <meta name='twitter:description' content={fm(m.app.Terms.seoDescription)} />
        </Helmet>
        <MarketingHeader />
        <div className='app__long-content'>
          <h2>Terms and conditions</h2>
          <TermsContent />
        </div>
      </div>
    )
  }
}

export const TermsRoute = {
  path: '/terms',
  component: injectIntl(Terms)
}
