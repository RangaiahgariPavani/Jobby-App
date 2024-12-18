import {Component} from 'react'
import Cookies from 'js-cookie'
import {MdLoocationOn} from 'react-icons/md'
import {AiFillStar} from 'react-icons/ai'
import {BiLinkExternal} from 'react-icons/bi'

import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarJobs from '../SimilarJobs'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class AboutJobItem extends Component {
  state = {
    jobDataDetails: [],
    similarJobsData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobData()
  }

  getJobData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })

    const jwtToken = Cookies.get('jwt_token')
    const jobDetailsApiUrl = `https://apis.ccbp.in/login/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }

    const responseJobData = await fetch(jobDetailsApiUrl, options)

    if (responseJobData.ok) {
      const fetchedData = await responseJobData.json()
      const updatedJobDetailsData = [fetchedData.job_details].map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        companyWebsiteUrl: eachJob.company_website_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        lifeAtCompany: {
          description: eachJob.life_at_company.description,
          imageUrl: eachJob.life_at_company.image_url,
        },
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        skills: eachJob.skills.map(eachSkill => ({
          imageUrl: eachSkill.image_url,
          name: eachSkill.name,
        })),
        title: eachJob.title,
      }))

      const updatedSimilarJobDetails = [fetchedData.similar_jobs].map(
        eachJob => ({
          companyLogoUrl: eachJob.company_logo_url,
          id: eachJob.id,
          employmentType: eachJob.employment_type,
          jobDescription: eachJob.job_description,
          rating: eachJob.rating,
          location: eachJob.location,
          title: eachJob.title,
        }),
      )

      this.setState({
        jobDataDetails: updatedJobDetailsData,
        similarJobsData: updatedSimilarJobDetails,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderJobDetailsSuccessView = () => {
    const {jobDataDetails, similarJobsData} = this.state
    if (jobDataDetails.length >= 1) {
      const {
        companyLogoUrl,
        companyWebsiteUrl,
        employmentType,
        id,
        jobDescription,
        lifeAtCompany,
        location,
        packagePerAnnum,
        rating,
        title,
        skills,
      } = jobDataDetails[0]

      return (
        <>
          <div className="job-item-container">
            <div className="img-title-container">
              <img
                src={companyLogoUrl}
                className="company-logo"
                alt="job details company logo"
              />
              <div className="title-rating-container">
                <h1 className="title-heading">{title}</h1>
                <div className="star-rating-container">
                  <AiFillStar className="star-icon" />
                  <p className="rating-text">{rating}</p>
                </div>
              </div>
            </div>
            <div className="location-package-container">
              <div className="location-job-type-container">
                <div className="location-icon-container">
                  <MdLoocationOn className="location-icon" />
                  <p className="location">{location}</p>
                </div>
                <div className="employment-type-icon-employment-type-container">
                  <p className="job-type">{employmentType}</p>
                </div>
              </div>
              <div className="package-container">
                <p className="package">{packagePerAnnum}</p>
              </div>
            </div>
          </div>
          <hr className="item-hr-line" />
          <div className="description-visit-container">
            <h1 className="description-job-heading">Description</h1>
            <a className="visit-anchor" href={companyWebsiteUrl}>
              Visit <BiLinkExternal />
            </a>
          </div>
          <p className="description-para">{jobDescription}</p>
          <h1>Skills</h1>
          <ul className="ul-job-details-container">
            {skills.map(eachSkill => (
              <li className="li-job-details-container" key={eachSkill.name}>
                <img
                  src={eachSkill.imageUrl}
                  alt={eachSkill.name}
                  className="skill-img"
                />
                <p>{eachSkill.name}</p>
              </li>
            ))}
          </ul>
          <div className="company-life-img-container">
            <div className="life-heading-par-container">
              <h1>Life at Company</h1>
              <p>{lifeAtCompany.description}</p>
            </div>
            <img src={lifeAtCompany.imageUrl} alt="life at company" />
          </div>
          <h1 className="similar-jobs-heading">Similar Jobs</h1>
          <ul className="similar-jobs-ul-container">
            {similarJobsData.map(eachJob => (
              <SimilarJobs
                key={eachJob.id}
                similarJobData={eachJob}
                employmentType={employmentType}
              />
            ))}
          </ul>
        </>
      )
    }
    return null
  }

  onRetryJobdetailsAgain = () => {
    this.getJobData()
  }

  renderJobFailureView = () => (
    <div className="job-details-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you rae looking for.</p>
      <div className="failure-container-btn">
        <button
          className="failure-job-details-btn"
          type="button"
          onClick={this.onRetryJobdetailsAgain}
        >
          retry
        </button>
      </div>
    </div>
  )

  renderJobLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetailsSuccessView()
      case apiStatusConstants.failure:
        return this.renderJobFailureView()
      case apiStatusConstants.inProgress:
        return this.renderJobLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-details-view-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}
export default AboutJobItem
