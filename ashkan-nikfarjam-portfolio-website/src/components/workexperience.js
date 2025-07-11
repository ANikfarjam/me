import React, { useState } from 'react';
import { FaBriefcase, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './styling/WorkExperienceTimeline.css';

const experiences = [
  {
    role: "IT Consultant",
    company: "Robert Half Technology",
    location: "San Francisco, CA",
    date: "May 2019 - Apr 2020",
    details: [
      "Managed clients’ servers and provided user support to enhance office efficiency.",
      "Developed Python and Bash scripts for automating backups and network tasks.",
      "Built JS/HTML/CSS dashboards for inventory and server monitoring."
    ],
    clients: [
      {
        name: "Mill Valley School District, Mill Valley, CA",
        industry: "School District",
        duration: "3 months",
        tasks: [
          "Assisted staff and students with their iOS or Mac devices to ensure flawless performance.",
          "Provided iPad support to students through a dedicated walk-in support station held twice weekly. Assisted students with troubleshooting, locating misplaced devices, and offered guidance to both students and teachers during visits.",
          "Updated backup power supply units (PSUs) in the district’s IDFs and MDFs to minimize or prevent downtime during power outages.",
          "Reconfigured VLANs for certain wireless access points (WAPs), enhancing network performance and connectivity.",
          "Utilized iBoss and VMware AirWatch to push restrictions and filtering settings required by the school district, install necessary applications on students’ iOS devices, and manage devices efficiently.",
          "Operated in a Mac-dominant environment, managing OS X packages through Munki server and repository.",
          "Developed backup and network drive mapping bash scripts to reduce manual workload.",
          "Created a dashboard for the IT department using JavaScript and HTML, consolidating various resources in one location to improve efficiency.",
          "Created Python scripts to update and manipulate Cisco network configuration files, establish SSH connections, and push configuration files to Cisco networking equipment."
        ]
      },
      {
        name: "GoldenGate Bridge and Highway Transit District, San Francisco, CA",
        industry: "Transit District",
        duration: "2 months",
        tasks: [
          "Set up imaging machines using identical Dell systems, allowing for simultaneous imaging without removing users' computers.",
            "Imaged new machines using Dell IA and client-provided images, and installed DriverPacks on SSDs.",
            "Scheduled appointments with district employees to swap SSDs and ensure their systems functioned flawlessly.",
            "Deployed patches and software using IBM BigFix.",
            "Migrated user data using pre-developed scripts during appointments to prevent data loss.",
            "Updated machine BIOS when needed to ensure compatibility and smooth OS booting.",
            "Resolved issues with virtual machine clients (Citrix) to ensure access to district applications.",
            "Imported printers using printer export files to restore user access to previously used printers."
        ]
      },
      {
        name: "MacGraph Rental Corp, Livermore, CA",
        industry: "Industrial Engineering",
        duration: "4 months",
        tasks: [
            "Hired to monitor and maintain the DataCenter backup server while the main technician was on medical leave.",
            "Provided IT support for the corporate office.",
            "Maintained and backed up data from various development servers.",
            "Utilized an outdated backup server to write data to optical tapes.",
            "Coordinated with a third-party company for off-site tape backups, overseeing the process.",
            "Monitored backup tasks, created backup schedules, and maintained servers experiencing security-related backup interruptions caused by permission or firewall conflicts.",
            "Successfully introduced and advocated for the adoption of cloud computing solutions such as AWS and Azure, emphasizing their cost-effectiveness and reliability."
        ]
      },
      {
        name: "Arnold & Porter Law Firm, San Francisco, CA",
        industry: "Law Firm",
        duration: "3 months",
        tasks:[
            "Assisted with operating system migration from Windows 7 to Windows 10.",
            "Provided IT support for a San Francisco office of 600 employees, primarily handling Microsoft Office issues such as add-ons, email signatures, Outlook settings, and other MS Office-related tasks.",
            "Performed system imaging and data migration to ensure seamless transitions during upgrades.",
            "Set up and troubleshot AV conference room equipment to support effective virtual meetings, and coordinated meetings between offices using Cisco Webex console.",
            "Implemented data encryption on users’ computers to enhance security protocols.",
            "Managed Active Directory and group policies to control user access and permissions based on managerial approvals.",
            "Configured and troubleshooted VPN connections on attorney computers to ensure secure remote access.",
            "Configured and troubleshooted virtual machines on user devices, enabling remote task execution without requiring VPN usage."
        ]
      }
    ]
  },
  {
    role: "Data Collector and Autonomous Vehicle Operator",
    company: "Adeco Onsite with Waymo/Google",
    location: "Mountain View, CA",
    date: "Jun 2018 - Nov 2018",
    details: [
        "Collected requested data using shell scripts to empower developers with valuable insights for product improvement.",
        "Operated an autonomous driving vehicle, intervening to address errors and providing commentary for correction.",
        "Managed collected data on SSD drives and organized them for streamlined access and utilization by developers."
    ]
  },
    {
    role: "Team Leader",
    company: "Just Energy",
    location: "San Jose, CA",
    date: "Apr 2017 - Jun 2018",
    details: [
        "Started as a Sales Representative and was promoted to Team Lead within three months. I managed a team of five sales reps. I achieved the Top Sales Award of the month for months of October, November, and December of 2017. Also set a company sales record with 25 sales in a single day."
    ]
  },
  {
    role: "IT Technician",
    company: "Click Away",
    location: "Sunnyvale, CA",
    date: "Feb 2016 - Mar 2017",
    details: [
        "Provided managed IT services to diverse clients, including consumers, small businesses, and large organizations such as Stanford Hospital.",
        "Specialized in repairing Apple and Windows machines, performing both hardware and software diagnostics.",
        "Offered comprehensive networking services, from basic setups like routers, switches, and access points to advanced configurations such as IP routing and NAS setups.",
        "Successfully set up Windows Server machines for clients and configured corresponding client machines."    ]
  },
  {
    role: "Sales Manager",
    company: "CM Marketing",
    location: "Sunnyvale, CA",
    date: "Mar 2014 - Jan 2016",
    details: [
        "Managed office of 25 reps. Was recognized as Office of the Year in 2015."
   ]
  }
];

const WorkExperienceTimeline = () => {
  const [openClientIdx, setOpenClientIdx] = useState(null);

  const toggleClient = (idx) => {
    setOpenClientIdx(openClientIdx === idx ? null : idx);
  };

  return (
    <div className="timeline-container">
      <h2>Work Experience</h2>
      <div className="timeline">
        {experiences.map((exp, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-icon">
              <FaBriefcase />
            </div>
            <div className="timeline-content">
              <h3>{exp.role} @ {exp.company}</h3>
              <span className="timeline-date">{exp.date}</span>
              <p className="timeline-location">{exp.location}</p>
              <ul>
                {exp.details.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>

              {exp.clients && (
                <div className="client-section">
                  <h4>Client Engagements:</h4>
                  {exp.clients.map((client, cidx) => (
                    <div key={cidx} className="client-block">
                      <div className="client-header" onClick={() => toggleClient(`${idx}-${cidx}`)}>
                        <strong>{client.name}</strong> <span>({client.industry}, {client.duration})</span>
                        {openClientIdx === `${idx}-${cidx}` ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                      {openClientIdx === `${idx}-${cidx}` && (
                        <ul className="client-tasks">
                          {client.tasks.map((task, tidx) => (
                            <li key={tidx}>{task}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceTimeline;
