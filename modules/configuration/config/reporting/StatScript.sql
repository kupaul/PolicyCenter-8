SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[fn_stat_code]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
BEGIN
execute dbo.sp_executesql @statement = N'CREATE FUNCTION [dbo].[fn_stat_code] 
		( @field_name varchar(100),
	@code_length int )
	RETURNS VARCHAR(100)
AS
--Get a numeric field, check for NULL, and return a varchar padded with zeros to the left of the number
--ex. integer in -> 442, varchar out -> 00442
--fn_stat_code(CarrierCode,5)
BEGIN
	
	DECLARE @counter int	
	declare @output varchar(100)
	declare @zero_row varchar(100)
	declare @zero_char varchar(1)

	--Convert inc to varchar
	--Check for NULL. If NULL return the char ''0'', else return field
	select @output = IsNull(convert(varchar(100),@field_name),''0'') 	
	
	--set default values
	Select @counter = 1	
	select @zero_char = ''0''
	select @zero_row = ''0''

	--Construct a sting of zeros
	--For example if the Code length is 5, then return ''00000''
	while @counter < @code_length
	begin
		select @counter = @counter + 1
		select @zero_row = @zero_row + @zero_char
	end

	--Pad the now converted numeric field with zeros
	select @output = substring(@zero_row,1, @code_length - len(@output)) + @output

	RETURN @output

END' 
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[fn_stat_space]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
BEGIN
execute dbo.sp_executesql @statement = N'CREATE FUNCTION [dbo].[fn_stat_space] 
		( @field_name varchar(250),
	@code_length int) -- 1 = numeric, 2 = date, 3 = string
	RETURNS VARCHAR(250)
AS
--Get a varchar field, check for NULL, and return a varchar padded with spaces to the right
--ex. varchar in -> ''WC0067'' , varchar out -> ''WC0067     ''
--fn_stat_space(PolicyNumber,18)
BEGIN	
	declare @output varchar(250)

select @output =
	case
		when isnumeric(@field_name)=1 --check for numeric
			--First convert numeric fields to varchar
			--Check for NULL. If NULL return space(0), else return field
			then IsNull(convert(varchar(250),@field_name),space(0))				
		--Check for NULL. If NULL return space(0), else return field
		else IsNull(@field_name,space(0))
	end

	--Pad the field with blank spaces
	select @output =  @output + space(@code_length - len(@output))

	RETURN @output

END
' 
END

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_name_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_name_record]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	substring(''00000'',1, 5 - len(sr.carrier_code))
	+ sr.CARRIER_CODE
--2 Policy Number
	+ sr.POLICY_NUMBER 
	+ space(18 - len(sr.POLICY_NUMBER))
--3 future use
	+ space(1)
--4 Unit Number
	+ sr.unit_number 
	+ space(6 - len(sr.unit_number))
--5 Exposure State
	+ substring(''00'',1, 2 - len(sr.exposure_state))
	+ sr.exposure_state
--6 Policy Effective Date
	+ policy_eff_date
--7 Report Level
	+ IsNull(report_level,space(1))
--8 Correction Seq
	+ IsNull(correction_seq,space(1))

/*********** Name Record ***********/
--9 Record Type
	+ ''2'' --Name Record
--10 Insured Name
	+ sr.insured_name
	+ space(79 - len(sr.insured_name))
--11 future use
	+ space(130)

as MainString
FROM pcrv_stat_base SR 

' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_address_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_address_record]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	substring(''00000'',1, 5 - len(sr.carrier_code))
	+ sr.CARRIER_CODE
--2 Policy Number
	+ sr.POLICY_NUMBER 
	+ space(18 - len(sr.POLICY_NUMBER))
--3 future use
	+ space(1)
--4 Unit Number
	+ sr.unit_number 
	+ space(6 - len(sr.unit_number))
--5 Exposure State
	+ substring(''00'',1, 2 - len(sr.exposure_state))
	+ sr.exposure_state
--6 Policy Effective Date
	+ policy_eff_date
--7 Report Level
	+ IsNull(report_level,space(1))
--8 Correction Seq
	+ IsNull(correction_seq,space(1))

/*********** Address Record ***********/
--9 Record Type
	+ ''3'' --Address Record
--10 Insured Address
	+ sr.insured_address
	+ space(79 - len(sr.insured_address))
--11 future use
	+ space(130)

as MainString
FROM pcrv_stat_base SR 

' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_presentation]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_presentation]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	substring(''00000'',1, 5 - len(sr.carrier_code))
	+ sr.CARRIER_CODE
--2 Policy Number
	+ sr.POLICY_NUMBER 
	+ space(18 - len(sr.POLICY_NUMBER))
--3 future use
	+ space(1)
--4 Unit Number
	+ sr.unit_number 
	+ space(6 - len(sr.unit_number))
--5 Exposure State
	+ substring(''00'',1, 2 - len(sr.exposure_state))
	+ sr.exposure_state
--6 Policy Effective Date
	+ policy_eff_date
--7 Report Level
	+ IsNull(report_level,space(1))
--8 Correction Seq
	+ IsNull(correction_seq,space(1))

/*********** Header Record ***********/
--9 Record Type
	+ ''1''
--10 Policy Conditions Code
	+ ''000000000000''
--11 future use
	+ space(1)
--12 Policy Expiration Date
	+ policy_exp_date
--13 Risk ID
	+ sr.risk_id
	+ space(9 - len(sr.risk_id))
--14 future use
	+ space(1)
--15 Orig Admin Number
	+ sr.orig_admin_number
	+ space(10 - len(sr.risk_id))
--16 Term Code (Not used for ASWG)
	+ ''0''
--17 Leasing Code
	+ case 
		when sr.employee_leasing = 1
		then ''E''
		else space(1) 
	end
--18 Policy Type ID code (not used for ASWG)
	+ ''00''
--19 future use
	+ space(20)
--20 Replacement Report (ADD LOGIC LATER) !!!!!!!!!!!!!
	+ space(1)
--21 future use
	+ space(16)
--22 Correction Type
	+ sr.correction_type
--23 State Effective Date
	+ sr.state_eff_date
--24 FEIN
	+ sr.fein
--25 future use
	+ space(8)
--26 Policy Condition Indicators
	--Three Year
	+ Case
		when three_year_fixed_rate = 1 then ''Y''
		when three_year_fixed_rate = 0 then ''N''
		else '' ''
	end
	--Multistate
	+ Case
		when Multistate = 1	then ''Y''
		when Multistate = 0	then ''N''
		else '' ''
	end
	--Interstate Rated
	+ Case
		when interstate_rated = 1 then ''Y''
		when interstate_rated = 0 then ''N''
		else '' ''
	end
	--Estimated Exposure
	+ Case
		when Estimated_exposure = 1	then ''Y''
		when Estimated_exposure = 0	then ''N''
		else '' ''
	end
	--Retrospective Rated
	+ Case
		when retrospective_rated = 1	then ''Y''
		when retrospective_rated = 0	then ''N''
		else '' ''
	end
	--Canceled Midterm
	+ Case
		when canceled_midterm = 1	then ''Y''
		when canceled_midterm = 0	then ''N''
		else '' ''
	end
	--MCO
	+ Case
		when mco = 1	then ''Y''
		when mco = 0	then ''N''
		else '' ''
	end
--27 future use
	+ space(4)
--28 Policy Type
	+ policy_type_coverage
	+ policy_type_plan
	+ policy_type_non_std
--29 future use
	+ space(2)
--30 Deductible Type Code
	+ deductible_type_1
	+ deductible_type_2
--31 Deductible Percent Factor
	+ substring(''00'',1, 2 - len(sr.deductible_percent_factor))
	+ sr.deductible_percent_factor
--32 Deductible Amt Per Claim Accident
	+ substring(''000000000'',1, 9 - len(sr.DeductibleAmtPerClaimAccident))
	+ sr.DeductibleAmtPerClaimAccident
--33 Deductible Amt Aggregate
	+ substring(''000000000'',1, 9 - len(sr.DeductibleAmtAggregate))
	+ sr.DeductibleAmtAggregate
--34 Prev Report Level
	+ substring(''00'',1, 2 - len(sr.prev_report_level))
	+ sr.prev_report_level
--35 future use
	+ space(1)
--36 Prev Correction Seq
	+ sr.prev_correction_seq
--37 Prev Carrier Code
	+ substring(''00000'',1, 5 - len(sr.prev_carrier_code))
	+ sr.prev_carrier_code
--38 Prev Policy Number
	+ sr.prev_policy_number 
	+ space(18 - len(sr.prev_policy_number))
--39 Policy Effective Date
	+ prev_policy_eff_date 
--40 Prev Exposure State 
	+ substring(''00'',1, 2 - len(sr.prev_exposure_state))
	+ sr.prev_exposure_state 
--41 Prev Unit Number
	+ sr.prev_unit_number 
	+ space(7 - len(sr.prev_unit_number))
--42, 43 future use
	+ space(18)
--44 Beep Bypass
	+ Case
		when beep_bypass = 1	then ''F''		
		else '' ''
	end
--45 ASWG Unit Format
	+ aswg_unit_format 
as MainString
FROM pcrv_stat_base SR 

' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_submission]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_submission]
as

select 
--Num Detail Records
	IsNull(convert(varchar(8),ss.NumDetailRecords),''0'') 
		as num_detail_records,
--Num Unit Reports
	IsNull(convert(varchar(7),ss.NumUnitReports),''0'')
		as num_unit_reports,
--Primary Effective Date - date format is YYYYMM
	IsNull(
		convert(varchar(4),year(ss.Primaryeffdate))
		--pad single digit months with a leading zero
		+ substring(''00'',1, 2 - len(month(ss.Primaryeffdate)))
		+ convert(varchar(2),month(ss.Primaryeffdate))
	,''000000'') as primary_eff_date,
--Num ICRs
	IsNull(convert(varchar(8),ss.NumICRs),''0'') as num_icrs,
--ASWG SubType
	IsNull(aswg.TypeCode,space(1)) as aswg_subtype

from 
	pc_wciostatsubmission ss
	left join pctl_aswgSubType aswg
		on ss.ASWGSubType = aswg.id
/*

select 
reportid as report_id,
sl.id as loss_id,
--Class Code
	IsNull(convert(varchar(4),sl.ClassCode),''0'') as class_code,
--Claim Count
	IsNull(convert(varchar(4),sl.ClaimCount),''0'') as claim_count,
--Accident Date
	IsNull(convert(varchar(6),sl.AccidentDate,12),''000000'') as accident_date,
--Claim Number
	IsNull(sl.ClaimNumber,space(0)) as claim_number,
--Claim Status
	IsNull(cs.TypeCode,''0'') as claim_status,
--Weekly Wage Amount
	IsNull(convert(varchar(5),sl.WeeklyWageAmt),''0'') as weekly_wage_amt,
--Injury Type
	IsNull(it.TypeCode,''00'') as injury_type,
--Catastrophe Number
	IsNull(convert(varchar(2),sl.CatastropheNumber),''0'') as catastrophe_number,
--Incurred Indemnity Amount
	IsNull(convert(varchar(9),sl.IncurredIndemnityAmt),''0'') as incurred_indemnity_amt,
--Incurred Medical Amount
	IsNull(convert(varchar(9),sl.IncurredMedicalAmt),''0'') as incurred_medical_amt,
--SSN
	IsNull(convert(varchar(9),sl.SSN),''0'') as ssn,
--Update Type
	IsNull(ut.TypeCode,space(1)) as update_type,
--Loss Condition Codes
	--Loss Act
	IsNull(la.TypeCode,''00'') as loss_act,
	--Loss Type
	IsNull(lt.TypeCode,''00'') as loss_type,
	--Recovery Type
	IsNull(rt.TypeCode,''00'') as recovery_type,
	--Claim Type
	IsNull(ct.TypeCode,''00'') as claim_type,
	--Settlement Type
	IsNull(st.TypeCode,''00'') as settlement_type,
--Total Incurred Voc Rehab Amt
	IsNull(convert(varchar(7),TotalIncurredVocRehabAmt),''0'') 
		as total_incurred_voc_rehab_amt,
--Jurisdiction State
	IsNull(state.TypeCode,''00'') as jurisdiction_state,
--MCO Type
	IsNull(mco.TypeCode,''00'') as mco_type,
--Injury Description Code
	--Injury Part
	IsNull(ip.TypeCode,''00'') as injury_part,
	--Injury Nature
	IsNull(injn.TypeCode,''00'') as injury_nature,
	--Injury Cause
	IsNull(ic.TypeCode,''00'') as injury_cause,
--Occupation Desc
	IsNull(sl.OccupationDesc,space(0)) as occupation_desc,
--Vocational Rehab
	sl.VocationalRehab as vocational_rehab,
--Lump Sum
	sl.LumpSum as lump_sum,
--Fraud Claim
	IsNull(fc.TypeCode,''00'') as fraud_claim,
--Paid Indemnity Amt
	IsNull(convert(varchar(9),sl.PaidIndemnityAmt),''0'')
		as paid_indemnity_amt,
--Paid Medical Amt
	IsNull(convert(varchar(9),sl.PaidMedicalAmt),''0'')
		as paid_medical_amt,
--Claimant Attorney Fees
	IsNull(convert(varchar(9),sl.ClaimantAttorneyFees),''0'')
		as claimant_attorney_fees,
--Employer Attorney Fees
	IsNull(convert(varchar(9),sl.EmployerAttorneyFees),''0'')
		as employer_attorney_fees,
--Deductible Reimburse Amt
	IsNull(convert(varchar(9),sl.DeductibleReimburseAmt),''0'')
		as deductible_reimburse_amt,
--Total Gross Incurred Amt
	IsNull(convert(varchar(9),sl.TotalGrossIncurredAmt),''0'')
		as total_gross_incurred_amt,
--Paid ALAE Amt
	IsNull(convert(varchar(9),sl.PaidALAEAmt),''0'')
		as paid_alae_amt,
--Incurred ALAE Amt
	IsNull(convert(varchar(9),sl.IncurredALAEAmt),''0'')
		as incurred_alae_amt,
--Scheduled Indemnity
	IsNull(convert(varchar(3),sl.ScheduledIndemnity),''0'')
		as scheduled_indemnity

from pc_wciostatloss sl
	left join pctl_wcioclaimstatus cs
		on sl.claimstatus = cs.id
	left join pctl_wcioinjurytype it
		on sl.injurytype = it.id
	left join pctl_wcioupdatetype ut
		on sl.UpdateType = ut.id
	left join pctl_wciolossact la
		on sl.LossAct = la.id
	left join pctl_wciolosstype lt
		on sl.LossType = lt.id
	left join pctl_wcioRecoveryType rt
		on sl.RecoveryType = rt.id
	left join pctl_wcioClaimType ct
		on sl.ClaimType = ct.id
	left join pctl_wcioSettlementType st
		on sl.SettlementType = st.id
	left join pctl_wcioState state
		on sl.JurisdictionState = state.id
	left join pctl_wcioMCOType mco
		on sl.MCOType = mco.id
	left join pctl_wcioInjuryPart ip
		on sl.InjuryPart = ip.id
	left join pctl_wcioInjuryNature injn
		on sl.InjuryNature = injn.id
	left join pctl_wcioInjuryCause ic
		on sl.InjuryCause = ic.id
	left join pctl_wcioFraudClaim fc
		on sl.FraudClaim = fc.id
*/' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_exposure_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_exposure_record]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	dbo.fn_stat_code(sr.carriercode,5) 
--2 Policy Number
	+ dbo.fn_stat_space(sr.policynumber,18) 
--3 future use
	+ space(1)
--4 Unit Number
	+ dbo.fn_stat_space(sr.unitnumber,6) 	
--5 Exposure State
	+ dbo.fn_stat_code(st.typecode,2)
--6 Policy Effective Date
	--Convert to date to varchar in the format YYMMDD
	--Check for NULL. If NULL return ''000000'', else return formatted date
	+ IsNull(convert(varchar(6),sr.policyeffdate,12),''000000'')
--7 Report Level
	+ case
		--check if null
		when sr.reportlevel is null
			then space(1)
		--if < 10 then return number
		when SR.REPORTLEVEL < 10
			then convert(varchar(1),SR.REPORTLEVEL )
		--if > 10 then return a char, A for 10 , B for 11, etc.
		else char(SR.REPORTLEVEL + 55)
	end
--8 Correction Seq
	+ case
		--check if null
		when sr.CORRECTIONSEQ is null
			then space(1)
		--if < 10 then return number
		when SR.CORRECTIONSEQ < 10
			then convert(varchar(1),SR.CORRECTIONSEQ )
		--if > 10 then return a char, A for 10 , B for 11, etc.
		else char(SR.CORRECTIONSEQ + 55)
	end

/*********** Exposure Record ***********/
--9 Record Type
	+ ''4'' --Exposure Record 
--10 future use
	+ space(1)
--11 Class Code
	+ dbo.fn_stat_code(se.ClassCode,4)
--12 future use
	+ space(1)
--13,14 NOT IN USE
	+ ''000''
--15 Exp Mod - Decimal number, show thousandths ex. 0.890, show as 0890
	--Convert decimal to int, showing thousandths
	+ dbo.fn_stat_code(convert(int,se.ExpMod*1000),4)
--16 Exp Mod Effective Date
	--see 6 above for format
	+ IsNull(convert(varchar(6),se.expmodeffdate,12),''000000'')	
--17 Rate Eff Date
	--see 6 above for format
	+ IsNull(convert(varchar(6),se.rateeffdate,12),''000000'')
--18 Exposure Amount
	+ dbo.fn_stat_code(se.ExposureAmt,10)	
--19 Premium Amt
	+ dbo.fn_stat_code(se.PremiumAmt,9)	
--20 Manual Rate ***********ADD LOGIC !!!!!!!!!!!!!!!!!!
	--Convert decimal to int, showing thousandths
	+ dbo.fn_stat_code(convert(int,se.ManualRate*1000),7)
--21 Split Period --0 represents the first period, 1 the second, etc.
	+ IsNull(convert(varchar(1),se.splitperiod-1),''0'')
--22 future use
	+ space(17)
--23 Rating Tier ID
	+ dbo.fn_stat_code(se.RatingTierID,2)
--24 future use
	+ space(8)
--25 Update Type
	+ dbo.fn_stat_space(ut.typecode,1)
--26 future use
	+ space(1)
--27 Exposure Act or Coverage
	+ dbo.fn_stat_space(ea.typecode,2)
--28 future use
	+ space(126)
as MainString
from PC_WCIOSTATREPORT sr 
	left JOIN PCTL_WCIOSTATE ST
		ON SR.EXPOSURESTATE = ST.ID
	inner join pc_wciostatexposure se
		on sr.id = se.reportid
	left join pctl_wcioupdatetype ut
		on se.updatetype = ut.id
	left join pctl_wcioExposureActOrCov ea
		on se.exposureActOrCov = ea.id
' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_base]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_base]
as

select --if field is null, return 0 for numeric fields, '''' for char (actually space(0))
sr.id as report_id,
--****************LINK**********
--Carrier Code
	IsNull(convert(varchar(5),SR.CARRIERCODE),''0'') as carrier_code,
--Policy Number
	IsNull(sr.policynumber,space(0)) as policy_number,
--Unit Number
	--check to see if null, if so return space(0)
	--otherwise return converted number
	IsNull(convert(varchar(6),sr.unitnumber),space(0)) as unit_number,
--Exposure State
	IsNull(ST.TYPECODE,space(0)) as exposure_state,
--Policy Effective Date
	IsNull(convert(varchar(6),policyeffdate,12),''000000'') as policy_eff_date,
--Report Level
	case
		when SR.REPORTLEVEL < 10
		then convert(varchar(1),SR.REPORTLEVEL )
		else char(SR.REPORTLEVEL + 55)
	end as report_level,
--Correction Sequence
	case
		when SR.CORRECTIONSEQ < 10
		then convert(varchar(1),SR.CORRECTIONSEQ )
		else char(SR.CORRECTIONSEQ + 55)
	end as correction_seq,
--***************** Header ************************
--Policy Expiration Date
	IsNull(convert(varchar(6),PolicyExpOrCancelDate,12),''000000'') as policy_exp_date,
--Risk ID
	IsNull(sr.RiskID, space(0)) as risk_id,
--Orig Admin Number
	IsNull(sr.OrigAdminNumber,space(0)) as orig_admin_number,
--Employee Leasing
	IsNull(sr.EmployeeLeasing,space(0)) as employee_leasing,
--Correction Type
	IsNull(ct.typecode,space(1)) as correction_type,
--State Effective Date
	IsNull(convert(varchar(6),StateEffectiveDate,12),''000000'') as state_eff_date,
--FEIN
	IsNull(convert(varchar(9),SR.FEIN),''000000000'') as fein,
--Policy Condition Indicators
	--Three Year Fixed Rate
	sr.ThreeYearFixedRate as three_year_fixed_rate,
	sr.Multistate,
	sr.InterstateRated as Interstate_rated,
	sr.EstimatedExposure as Estimated_exposure,
	sr.RetrospectiveRated as retrospective_rated,
	sr.CanceledMidterm as canceled_midterm,
	sr.mco,
--Policy Type
	--Policy Type Coverage	
	IsNull(ptc.TYPECODE,space(2)) as policy_type_coverage,
	--Policy Type Plan
	IsNull(ptp.TYPECODE,space(2)) as policy_type_plan,
	--Policy Type Non Std
	IsNull(ptns.TYPECODE,space(2)) as policy_type_non_std,
--Deductible Type Code
	IsNull(dt1.typecode,''00'') as deductible_type_1,
	IsNull(dt2.typecode,''00'') as deductible_type_2,
--Deductible Percent Factor
	IsNull(convert(varchar(2),sr.DeductiblePercentFactor),''00'') 
		as deductible_percent_factor,
--Deductible Amt Per Claim Accident
	IsNull(convert(varchar(9),SR.DeductibleAmtPerClaimAccident),''0'') 
		as DeductibleAmtPerClaimAccident,
--Deductible Amt Aggregate
	IsNull(convert(varchar(9),SR.DeductibleAmtAggregate),''0'') 
		as DeductibleAmtAggregate,
--Prev Report Level
	IsNull(convert(varchar(2),SR.PrevReportLevel),''00'')
		as prev_report_level,
--Prev Correction Seq
	IsNull(convert(varchar(1),sr.PrevCorrectionSeq),space(1))
		as prev_correction_seq,
--Prev Carrier Code
	IsNull(convert(varchar(5),sr.PrevCarrierCode),''0'')
		as prev_carrier_code,
--Prev Policy Number
	IsNull(sr.PrevPolicyNumber,space(0))
		as prev_policy_number,
--Prev Policy Effective Date
	IsNull(convert(varchar(6),Prevpolicyeffdate,12),''000000'') 
		as prev_policy_eff_date,
--Prev Exposure State
	IsNull(PST.TYPECODE,space(0)) as prev_exposure_state,
--Prev Unit Number
	IsNull(convert(varchar(7),sr.PrevUnitNumber),space(0)) 
		as prev_unit_number,
--Beep Bypass
	sr.BeepBypass as beep_bypass,
--ASWG Unit Format
	IsNull(auf.TypeCode,space(1)) as aswg_unit_format,
--************ Name record *****************
--Insured Name
	IsNull(sr.InsuredName,space(0)) as insured_name,
--************ Address record *****************
--Insured Address
	IsNull(sr.InsuredAddress,space(0)) as insured_address,
--************* Unit Total Record *************
--Payroll Exposure Total	
	IsNull(convert(varchar(11),sr.PayrollExposureTotal),''0'')
		as payroll_exposure_total,
--Other Exposure Total	
	IsNull(convert(varchar(10),sr.OtherExposureTotal),''0'')
		as other_exposure_total,
--Subject Premium Total	
	IsNull(convert(varchar(10),sr.SubjectPremiumTotal),''0'')
		as subject_premium_total,
--Std Premium Total	
	IsNull(convert(varchar(11),sr.StdPremiumTotal),''0'')
		as std_premium_total,
--Claim Count Total
	IsNull(convert(varchar(5),sr.ClaimCountTotal),''0'')
		as claim_count_total,
--Incurred Indemnity Amt Total
	IsNull(convert(varchar(10),sr.IncurredIndemnityAmtTotal),''0'')
		as incurred_indemnity_amt_total,
--Incurred Medical Amt Total
	IsNull(convert(varchar(10),sr.IncurredMedicalAmtTotal),''0'')
		as incurred_medical_amt_total,
--Num Unit Report Records
	IsNull(convert(varchar(5),sr.NumUnitReportRecords),''0'')
		as num_unit_report_records,
--Paid Indemnity Amt Total
	IsNull(convert(varchar(10),sr.PaidIndemnityAmtTotal),''0'')
		as paid_indemnity_amt_total,
--Paid Medical Amt Total
	IsNull(convert(varchar(10),sr.PaidMedicalAmtTotal),''0'')
		as paid_medical_amt_total,
--Claimant Attorney Fees Total
	IsNull(convert(varchar(10),sr.ClaimantAttorneyFeesTotal),''0'')
		as claimant_attorney_fees_total,
--Employer Attorney Fees Total
	IsNull(convert(varchar(10),sr.EmployerAttorneyFeesTotal),''0'')
		as employer_attorney_fees_total,
--Paid ALAE Amt Total
	IsNull(convert(varchar(10),sr.PaidALAEAmtTotal),''0'')
		as paid_alae_amt_total,
--Incurred ALAE Amt Total
	IsNull(convert(varchar(10),sr.IncurredALAEAmtTotal),''0'')
		as incurred_alae_amt_total

FROM PC_WCIOSTATREPORT SR 
	LEFT JOIN PCTL_WCIOSTATE ST
		ON SR.EXPOSURESTATE = ST.ID
	left join pctl_wciocorrectiontype ct
		on sr.correctiontype = ct.id
	left join pctl_wcioPolTypeCov ptc
		on sr.policytypeCoverage = ptc.id
	left join pctl_wcioPolTypePlan ptp
		on sr.policytypePlan = ptp.id
	left join pctl_wcioPolTypeNonStd ptns
		on sr.policytypeNonStd = ptns.id
	left join pctl_wciodeductibletype1 dt1
		on sr.deductibleType1 = dt1.id
	left join pctl_wciodeductibletype2 dt2
		on sr.deductibleType2 = dt2.id
	LEFT JOIN PCTL_WCIOSTATE PST
		ON SR.PrevExposureState = PST.ID
	left join pctl_aswgUnitFormat auf
		on sr.ASWGUnitFormat = auf.id' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_loss]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_loss]
as

select 
reportid as report_id,
sl.id as loss_id,
--Class Code
	IsNull(convert(varchar(4),sl.ClassCode),''0'') as class_code,
--Claim Count
	IsNull(convert(varchar(4),sl.ClaimCount),''0'') as claim_count,
--Accident Date
	IsNull(convert(varchar(6),sl.AccidentDate,12),''000000'') as accident_date,
--Claim Number
	IsNull(sl.ClaimNumber,space(0)) as claim_number,
--Claim Status
	IsNull(cs.TypeCode,''0'') as claim_status,
--Weekly Wage Amount
	IsNull(convert(varchar(5),sl.WeeklyWageAmt),''0'') as weekly_wage_amt,
--Injury Type
	IsNull(it.TypeCode,''00'') as injury_type,
--Catastrophe Number
	IsNull(convert(varchar(2),sl.CatastropheNumber),''0'') as catastrophe_number,
--Incurred Indemnity Amount
	IsNull(convert(varchar(9),sl.IncurredIndemnityAmt),''0'') as incurred_indemnity_amt,
--Incurred Medical Amount
	IsNull(convert(varchar(9),sl.IncurredMedicalAmt),''0'') as incurred_medical_amt,
--SSN
	IsNull(convert(varchar(9),sl.SSN),''0'') as ssn,
--Update Type
	IsNull(ut.TypeCode,space(1)) as update_type,
--Loss Condition Codes
	--Loss Act
	IsNull(la.TypeCode,''00'') as loss_act,
	--Loss Type
	IsNull(lt.TypeCode,''00'') as loss_type,
	--Recovery Type
	IsNull(rt.TypeCode,''00'') as recovery_type,
	--Claim Type
	IsNull(ct.TypeCode,''00'') as claim_type,
	--Settlement Type
	IsNull(st.TypeCode,''00'') as settlement_type,
--Total Incurred Voc Rehab Amt
	IsNull(convert(varchar(7),TotalIncurredVocRehabAmt),''0'') 
		as total_incurred_voc_rehab_amt,
--Jurisdiction State
	IsNull(state.TypeCode,''00'') as jurisdiction_state,
--MCO Type
	IsNull(mco.TypeCode,''00'') as mco_type,
--Injury Description Code
	--Injury Part
	IsNull(ip.TypeCode,''00'') as injury_part,
	--Injury Nature
	IsNull(injn.TypeCode,''00'') as injury_nature,
	--Injury Cause
	IsNull(ic.TypeCode,''00'') as injury_cause,
--Occupation Desc
	IsNull(sl.OccupationDesc,space(0)) as occupation_desc,
--Vocational Rehab
	sl.VocationalRehab as vocational_rehab,
--Lump Sum
	sl.LumpSum as lump_sum,
--Fraud Claim
	IsNull(fc.TypeCode,''00'') as fraud_claim,
--Paid Indemnity Amt
	IsNull(convert(varchar(9),sl.PaidIndemnityAmt),''0'')
		as paid_indemnity_amt,
--Paid Medical Amt
	IsNull(convert(varchar(9),sl.PaidMedicalAmt),''0'')
		as paid_medical_amt,
--Claimant Attorney Fees
	IsNull(convert(varchar(9),sl.ClaimantAttorneyFees),''0'')
		as claimant_attorney_fees,
--Employer Attorney Fees
	IsNull(convert(varchar(9),sl.EmployerAttorneyFees),''0'')
		as employer_attorney_fees,
--Deductible Reimburse Amt
	IsNull(convert(varchar(9),sl.DeductibleReimburseAmt),''0'')
		as deductible_reimburse_amt,
--Total Gross Incurred Amt
	IsNull(convert(varchar(9),sl.TotalGrossIncurredAmt),''0'')
		as total_gross_incurred_amt,
--Paid ALAE Amt
	IsNull(convert(varchar(9),sl.PaidALAEAmt),''0'')
		as paid_alae_amt,
--Incurred ALAE Amt
	IsNull(convert(varchar(9),sl.IncurredALAEAmt),''0'')
		as incurred_alae_amt,
--Scheduled Indemnity
	IsNull(convert(varchar(3),sl.ScheduledIndemnity),''0'')
		as scheduled_indemnity

from pc_wciostatloss sl
	left join pctl_wcioclaimstatus cs
		on sl.claimstatus = cs.id
	left join pctl_wcioinjurytype it
		on sl.injurytype = it.id
	left join pctl_wcioupdatetype ut
		on sl.UpdateType = ut.id
	left join pctl_wciolossact la
		on sl.LossAct = la.id
	left join pctl_wciolosstype lt
		on sl.LossType = lt.id
	left join pctl_wcioRecoveryType rt
		on sl.RecoveryType = rt.id
	left join pctl_wcioClaimType ct
		on sl.ClaimType = ct.id
	left join pctl_wcioSettlementType st
		on sl.SettlementType = st.id
	left join pctl_wcioState state
		on sl.JurisdictionState = state.id
	left join pctl_wcioMCOType mco
		on sl.MCOType = mco.id
	left join pctl_wcioInjuryPart ip
		on sl.InjuryPart = ip.id
	left join pctl_wcioInjuryNature injn
		on sl.InjuryNature = injn.id
	left join pctl_wcioInjuryCause ic
		on sl.InjuryCause = ic.id
	left join pctl_wcioFraudClaim fc
		on sl.FraudClaim = fc.id
' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_unit_total_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_unit_total_record]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	substring(''00000'',1, 5 - len(sr.carrier_code))
	+ sr.CARRIER_CODE
--2 Policy Number
	+ sr.POLICY_NUMBER 
	+ space(18 - len(sr.POLICY_NUMBER))
--3 future use
	+ space(1)
--4 Unit Number
	+ sr.unit_number 
	+ space(6 - len(sr.unit_number))
--5 Exposure State
	+ substring(''00'',1, 2 - len(sr.exposure_state))
	+ sr.exposure_state
--6 Policy Effective Date
	+ policy_eff_date
--7 Report Level
	+ IsNull(report_level,space(1))
--8 Correction Seq
	+ IsNull(correction_seq,space(1))

/*********** Unit Total Record ***********/
--9 Record Type
	+ ''6'' --Unit Total Record
--10 Payroll Exposure Total
	+ substring(''00000000000'',1, 11 - len(sr.payroll_exposure_total))
	+ sr.payroll_exposure_total
--11 Other Exposure Total
	+ substring(''0000000000'',1, 10 - len(sr.other_exposure_total))
	+ sr.other_exposure_total	
--12 Subject Premium Total
	+ substring(''0000000000'',1, 10 - len(sr.subject_premium_total))
	+ sr.subject_premium_total	
--13 Std Premium Total
	+ substring(''00000000000'',1, 11 - len(sr.std_premium_total))
	+ sr.std_premium_total	
--14 Claim Count Total
	+ substring(''00000'',1, 5 - len(sr.claim_count_total))
	+ sr.claim_count_total	
--15 Incurred Indemnity Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.incurred_indemnity_amt_total))
	+ sr.incurred_indemnity_amt_total	
--16 Incurred Medical Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.incurred_medical_amt_total))
	+ sr.incurred_medical_amt_total	
--17 Num Unit Report Records
	+ substring(''00000'',1, 5 - len(sr.num_unit_report_records))
	+ sr.num_unit_report_records	
--18 Previously Report Code (NOT USED)
	+ ''0''
--19 future use
	+ space(8)
--20 Paid Indemnity Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.paid_indemnity_amt_total))
	+ sr.paid_indemnity_amt_total
--21 Paid Medical Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.paid_medical_amt_total))
	+ sr.paid_medical_amt_total
--22 Claimant Attorney Fees Total
	+ substring(''0000000000'',1, 10 - len(sr.claimant_attorney_fees_total))
	+ sr.claimant_attorney_fees_total
--23 Employer Attorney Fees Total
	+ substring(''0000000000'',1, 10 - len(sr.employer_attorney_fees_total))
	+ sr.employer_attorney_fees_total
--24 Paid ALAE Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.paid_alae_amt_total))
	+ sr.paid_alae_amt_total
--25 Incurred ALAE Amt Total
	+ substring(''0000000000'',1, 10 - len(sr.incurred_alae_amt_total))
	+ sr.incurred_alae_amt_total
--26 future use
	+ space(68)

as MainString
FROM pcrv_stat_base SR 

' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_loss_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_loss_record]
as


SELECT
--*********** LINK DATA ***********
--1 Carrier Code
	substring(''00000'',1, 5 - len(sr.carrier_code))
	+ sr.CARRIER_CODE
--2 Policy Number
	+ sr.POLICY_NUMBER 
	+ space(18 - len(sr.POLICY_NUMBER))
--3 future use
	+ space(1)
--4 Unit Number
	+ sr.unit_number 
	+ space(6 - len(sr.unit_number))
--5 Exposure State
	+ substring(''00'',1, 2 - len(sr.exposure_state))
	+ sr.exposure_state
--6 Policy Effective Date
	+ policy_eff_date
--7 Report Level
	+ IsNull(report_level,space(1))
--8 Correction Seq
	+ IsNull(correction_seq,space(1))

/*********** Loss Record ***********/
--9 Record Type
	+ ''5'' --Loss Record
--10 future use
	+ space(1)
--11 Class Code
	+ substring(''0000'',1, 4 - len(sl.class_code))
	+ sl.class_code
--12 future use
	+ space(1)
--13,14 NOT IN USE
	+ ''000''
--15 Claim Count
	+ substring(''0000'',1, 4 - len(sl.claim_count))
	+ sl.claim_count	
--16 Accident Date
	+ sl.accident_date
--17 Claim Number
	+ space(12 - len(sl.claim_number))
	+ sl.claim_number
--18 Claim Status
	+ sl.claim_status
--19 Weekly Wage Amt
	+ substring(''00000'',1, 5 - len(sl.weekly_wage_amt))
	+ sl.weekly_wage_amt
--20 Injury Type
	+ sl.injury_type
--21 Catastrophe Number
	+ substring(''00'',1, 2 - len(sl.catastrophe_number))
	+ sl.catastrophe_number
--22 Incurred Indemnity Amt
	+ substring(''000000000'',1, 9 - len(sl.incurred_indemnity_amt))
	+ sl.incurred_indemnity_amt
--23 Incurred Medical Amt
	+ substring(''000000000'',1, 9 - len(sl.incurred_medical_amt))
	+ sl.incurred_medical_amt
--24 SSN
	+ substring(''000000000'',1, 9 - len(sl.ssn))
	+ sl.ssn
--25 future use
	+ space(11)
--26 Update Type 
	+ sl.update_type
--27 future use
	+ space(1)
--28 Loss Condition Codes
	+ sl.loss_act
	+ sl.loss_type
	+ sl.recovery_type
	+ sl.claim_type
	+ sl.settlement_type
--29 Total Incurred Voc Rehab Amt
	+ substring(''0000000'',1, 7 - len(sl.total_incurred_voc_rehab_amt))
	+ sl.total_incurred_voc_rehab_amt
--30 Jurisdiction State
	+ sl.jurisdiction_state
--31 MCO Type
	+ sl.mco_type
--32 Injury Description Code
	+ sl.injury_part
	+ sl.injury_nature
	+ sl.injury_cause
--33 Occupation Desc
	+ sl.occupation_desc
	+ space(18 - len(sl.occupation_desc))
--34 Vocational Rehab
	+ Case
		when sl.vocational_rehab = 1 then ''Y''
		else ''N''
	end
--35 Lump Sum
	+ Case
		when sl.lump_sum = 1 then ''Y''
		else ''N''
	end
--36 Fraud Claim
	+ sl.fraud_claim
--37 future use
	+ space(2)
--38 Paid Indemnity Amount
	+ substring(''000000000'',1, 9 - len(sl.paid_indemnity_amt))
	+ sl.paid_indemnity_amt
--39 Paid Medical Amt
	+ substring(''000000000'',1, 9 - len(sl.paid_medical_amt))
	+ sl.paid_medical_amt
--40 Claimant Attorney Fees
	+ substring(''000000000'',1, 9 - len(sl.claimant_attorney_fees))
	+ sl.claimant_attorney_fees
--41 Employer Attorney Fees
	+ substring(''000000000'',1, 9 - len(sl.employer_attorney_fees))
	+ sl.employer_attorney_fees
--42 Deductible Reimburse Amt
	+ substring(''000000000'',1, 9 - len(sl.deductible_reimburse_amt))
	+ sl.deductible_reimburse_amt
--43 Total Gross Incurred Amt
	+ substring(''000000000'',1, 9 - len(sl.total_gross_incurred_amt))
	+ sl.total_gross_incurred_amt
--44 future use
	+ space(2)
--45 Paid ALAE Amt
	+ substring(''000000000'',1, 9 - len(sl.paid_alae_amt))
	+ sl.paid_alae_amt
--46 Incurred ALAE Amt
	+ substring(''000000000'',1, 9 - len(sl.incurred_alae_amt))
	+ sl.incurred_alae_amt
--47 Scheduled Indemnity
	+ substring(''000'',1, 3 - len(sl.scheduled_indemnity))
	+ sl.scheduled_indemnity
as MainString
FROM pcrv_stat_base SR inner join pcrv_stat_loss sl
	on sr.report_id = sl.report_id

' 
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[pcrv_stat_submission_control_record]'))
EXEC dbo.sp_executesql @statement = N'
create view [dbo].[pcrv_stat_submission_control_record]
as


SELECT
--1 Filler
	''9999999999''
	+ ''9999999999''
	+ ''9999999999''
	+ ''9999999999''

/*********** Submission Control Record ***********/
--2 Record Type
	+ ''9'' --Submission Control Record
--3 Num Detail Records
	+ substring(''00000000'',1, 8 - len(ss.num_detail_records))
	+ ss.num_detail_records
--4 Num Unit Reports
	+ substring(''0000000'',1, 7 - len(ss.num_unit_reports))
	+ ss.num_unit_reports
--5 Primary Effective Date
	+ primary_eff_date
--6 Num ICRs
	+ substring(''00000000'',1, 8 - len(ss.num_icrs))
	+ ss.num_icrs
--7 future use
	+ space(179)
--8 ASWG SubType
	+ aswg_subtype
as MainString
FROM pcrv_stat_submission ss

' 
